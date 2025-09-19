'use client'

import { cn } from '@/lib/utils'

export type SentimentType = 'promoter' | 'passive' | 'detractor'

interface SentimentBadgeProps {
  sentiment: SentimentType
  score?: number
  showScore?: boolean
  className?: string
}

export function SentimentBadge({ 
  sentiment, 
  score,
  showScore = false,
  className 
}: SentimentBadgeProps) {
  const sentimentConfig = {
    promoter: {
      label: 'Promoter',
      className: 'sentiment-promoter',
      icon: '😊'
    },
    passive: {
      label: 'Passive',
      className: 'sentiment-passive', 
      icon: '😐'
    },
    detractor: {
      label: 'Detractor',
      className: 'sentiment-detractor',
      icon: '😞'
    }
  }

  const config = sentimentConfig[sentiment]

  return (
    <span className={cn('sentiment-badge', config.className, className)}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-80">({score})</span>
      )}
    </span>
  )
}