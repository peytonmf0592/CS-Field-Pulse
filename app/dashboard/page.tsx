'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Plus, MapPin, Calendar, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import toast from 'react-hot-toast'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

// Dynamically import map component to avoid SSR issues
const FieldMap = dynamic(() => import('@/components/FieldMap'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-white/60">Loading map...</div>
})

type SentimentKey = 'promoter' | 'passive' | 'detractor'
type ParticipantKey = 'inspector' | 'adjuster'

interface DashboardStats {
  totalInspectors: number
  totalAdjusters: number
  totalEngagements: number
  thisMonth: number
}

const createEmptyTotals = () => ({ promoter: 0, passive: 0, detractor: 0 })
const formatPercentage = (value: number, total: number) =>
  total === 0 ? '0' : Math.round((value / total) * 100).toString()

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const isDemoMode = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return url.length === 0 || url.includes('placeholder')
  }, [])

  const demoSentiment = useMemo(
    () => ({
      inspector: { promoter: 204, passive: 438, detractor: 159 },
      adjuster: { promoter: 48, passive: 113, detractor: 41 }
    }),
    []
  )

  const [stats] = useState<DashboardStats>({
    totalInspectors: 801,
    totalAdjusters: 200,
    totalEngagements: 1254,
    thisMonth: 0
  })

  const [selectedMarket, setSelectedMarket] = useState('Market')
  const [mapView, setMapView] = useState<'Map' | 'Satellite'>('Map')

  const [sentimentTotals, setSentimentTotals] = useState(() => ({
    inspector: createEmptyTotals(),
    adjuster: createEmptyTotals()
  }))
  const [isSentimentLoading, setIsSentimentLoading] = useState(false)

  const fetchSentiment = useCallback(
    async (withLoading = false) => {
      try {
        if (withLoading) setIsSentimentLoading(true)

        if (isDemoMode) {
          setSentimentTotals(demoSentiment)
          return
        }

        type SentimentSummaryRow =
          Database['public']['Functions']['get_sentiment_summary']['Returns'][number]

        const { data, error } = await supabase.rpc('get_sentiment_summary')

        if (error) {
          console.error('Error loading sentiment summary', error)
          toast.error('Unable to load sentiment data')
          return
        }

        const nextTotals: Record<ParticipantKey, ReturnType<typeof createEmptyTotals>> = {
          inspector: createEmptyTotals(),
          adjuster: createEmptyTotals()
        }

        const rows: SentimentSummaryRow[] = Array.isArray(data) ? data : []

        rows.forEach(({ participant_type, sentiment, total }) => {
          if (participant_type === 'inspector' || participant_type === 'adjuster') {
            nextTotals[participant_type][sentiment as SentimentKey] = Number(total)
          }
        })

        setSentimentTotals(nextTotals)
      } finally {
        setIsSentimentLoading(false)
      }
    },
    [demoSentiment, isDemoMode, supabase]
  )

  useEffect(() => {
    fetchSentiment(true)

    if (isDemoMode) {
      return
    }

    const channel = supabase
      .channel('dashboard-engagements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'engagements' }, () => {
        fetchSentiment()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSentiment, isDemoMode, supabase])

  const inspectorSentimentData = useMemo(
    () => ({
      labels: ['Promoter', 'Passive', 'Detractor'],
      datasets: [
        {
          data: [
            sentimentTotals.inspector.promoter,
            sentimentTotals.inspector.passive,
            sentimentTotals.inspector.detractor
          ],
          backgroundColor: ['#00ff88', '#ffcc00', '#ff4444'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    }),
    [
      sentimentTotals.inspector.promoter,
      sentimentTotals.inspector.passive,
      sentimentTotals.inspector.detractor
    ]
  )

  const adjusterSentimentData = useMemo(
    () => ({
      labels: ['Promoter', 'Passive', 'Detractor'],
      datasets: [
        {
          data: [
            sentimentTotals.adjuster.promoter,
            sentimentTotals.adjuster.passive,
            sentimentTotals.adjuster.detractor
          ],
          backgroundColor: ['#00ff88', '#ffcc00', '#ff4444'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    }),
    [
      sentimentTotals.adjuster.promoter,
      sentimentTotals.adjuster.passive,
      sentimentTotals.adjuster.detractor
    ]
  )

  const inspectorTotal = useMemo(
    () =>
      sentimentTotals.inspector.promoter +
      sentimentTotals.inspector.passive +
      sentimentTotals.inspector.detractor,
    [
      sentimentTotals.inspector.promoter,
      sentimentTotals.inspector.passive,
      sentimentTotals.inspector.detractor
    ]
  )

  const adjusterTotal = useMemo(
    () =>
      sentimentTotals.adjuster.promoter +
      sentimentTotals.adjuster.passive +
      sentimentTotals.adjuster.detractor,
    [
      sentimentTotals.adjuster.promoter,
      sentimentTotals.adjuster.passive,
      sentimentTotals.adjuster.detractor
    ]
  )

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = typeof context.parsed === 'number' ? context.parsed : 0
            const total = (context.dataset.data as number[]).reduce(
              (acc, datum) => acc + (typeof datum === 'number' ? datum : 0),
              0
            )
            const percentage = total === 0 ? '0.0' : ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    cutout: '65%'
  }

  const statCards = [
    {
      title: 'TOTAL INSPECTORS',
      value: stats.totalInspectors,
      color: 'text-white'
    },
    {
      title: 'TOTAL ADJUSTERS',
      value: stats.totalAdjusters,
      color: 'text-white'
    },
    {
      title: 'TOTAL ENGAGEMENTS',
      value: stats.totalEngagements,
      color: 'text-white'
    },
    {
      title: 'THIS MONTH',
      value: stats.thisMonth,
      color: 'text-white'
    }
  ]

  return (
    <div className="space-y-10 pb-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-6 justify-between mt-4">
        <div className="flex gap-4">
          <Button variant="primary" className="flex items-center gap-3 px-8 py-3 text-base">
            <Plus className="w-5 h-5" />
            RECORD VISIT
          </Button>
          <Button variant="secondary" className="flex items-center gap-3 px-8 py-3 text-base">
            <MapPin className="w-5 h-5" />
            Start Market Tour
          </Button>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-green-400 mb-2">📊 DASHBOARD</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-6 items-center bg-black/30 p-6 rounded-xl">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search inspectors or adjusters"
            className="glass-input w-full text-base py-3"
          />
        </div>
        <button className="glass-button px-6 py-3">
          <Search className="w-5 h-5" />
        </button>
        <select
          className="glass-input px-6 py-3 text-base"
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
        >
          <option>Market</option>
          <option>RFM</option>
        </select>
        <button className="text-white/60 hover:text-white text-base px-4">
          National (All Markets)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="text-center py-10 px-6">
              <p className="text-5xl font-bold text-green-400 mb-4">
                {stat.value}
              </p>
              <p className="text-sm text-white/60 uppercase tracking-wider font-medium">
                {stat.title}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Sentiment Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspector Sentiment */}
        <GlassCard className="p-8">
          <h3 className="text-base font-semibold text-white/90 mb-6">Inspector Sentiment</h3>
          <div className="relative h-56 mb-6">
            {isSentimentLoading ? (
              <div className="h-full flex items-center justify-center text-white/60">
                Loading sentiment...
              </div>
            ) : (
              <>
                <Doughnut data={inspectorSentimentData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{inspectorTotal}</p>
                    <p className="text-xs text-white/60">Total</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-400" />
                <span className="text-sm text-white/80">
                  Promoter: {sentimentTotals.inspector.promoter} (
                  {formatPercentage(sentimentTotals.inspector.promoter, inspectorTotal)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-sm text-white/80">
                  Passive: {sentimentTotals.inspector.passive} (
                  {formatPercentage(sentimentTotals.inspector.passive, inspectorTotal)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <span className="text-sm text-white/80">
                  Detractor: {sentimentTotals.inspector.detractor} (
                  {formatPercentage(sentimentTotals.inspector.detractor, inspectorTotal)}%)
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Adjuster Sentiment */}
        <GlassCard className="p-8">
          <h3 className="text-base font-semibold text-white/90 mb-6">Adjuster Sentiment</h3>
          <div className="relative h-56 mb-6">
            {isSentimentLoading ? (
              <div className="h-full flex items-center justify-center text-white/60">
                Loading sentiment...
              </div>
            ) : (
              <>
                <Doughnut data={adjusterSentimentData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{adjusterTotal}</p>
                    <p className="text-xs text-white/60">Total</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-400" />
                <span className="text-sm text-white/80">
                  Promoter: {sentimentTotals.adjuster.promoter} (
                  {formatPercentage(sentimentTotals.adjuster.promoter, adjusterTotal)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-sm text-white/80">
                  Passive: {sentimentTotals.adjuster.passive} (
                  {formatPercentage(sentimentTotals.adjuster.passive, adjusterTotal)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <span className="text-sm text-white/80">
                  Detractor: {sentimentTotals.adjuster.detractor} (
                  {formatPercentage(sentimentTotals.adjuster.detractor, adjusterTotal)}%)
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Field Coverage Map */}
        <GlassCard className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-white/90">Field Coverage Map</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMapView('Map')}
                className={`px-3 py-1 text-xs rounded ${mapView === 'Map' ? 'bg-green-400/20 text-green-400' : 'text-white/60'}`}
              >
                Map
              </button>
              <button
                onClick={() => setMapView('Satellite')}
                className={`px-3 py-1 text-xs rounded ${mapView === 'Satellite' ? 'bg-green-400/20 text-green-400' : 'text-white/60'}`}
              >
                Satellite
              </button>
            </div>
          </div>
          <div className="h-80 rounded-lg overflow-hidden">
            <FieldMap view={mapView} />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
