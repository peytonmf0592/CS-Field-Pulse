'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Shield, Users, MapPin, Mic, Camera, FileText } from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Users,
      title: 'Inspector & Adjuster Management',
      description: 'Track and manage field personnel with real-time updates'
    },
    {
      icon: BarChart3,
      title: 'Sentiment Analysis',
      description: 'AI-powered insights into field engagement quality'
    },
    {
      icon: MapPin,
      title: 'Field Coverage Maps',
      description: 'Visualize coverage areas and optimize resource allocation'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with row-level access control'
    },
    {
      icon: Mic,
      title: 'Voice Recording',
      description: 'Capture field notes with built-in voice transcription'
    },
    {
      icon: Camera,
      title: 'Photo Documentation',
      description: 'Upload and manage field photos with automatic organization'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Field Visits' },
    { value: '500+', label: 'Active Inspectors' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support' }
  ]

  if (!mounted) return null

  return (
    <>
      <ParticleBackground />
      <div className="relative min-h-screen">
        {/* Navigation */}
        <nav className="relative z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logos/company-symbol.png"
                alt="CS Field Pulse"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold gradient-text">CS Field Pulse</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="secondary">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">Field Engagement</span>
                <br />
                <span className="text-white">Tracking Platform</span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
                Streamline field operations with real-time tracking, sentiment analysis,
                and comprehensive reporting for insurance inspectors and adjusters.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="secondary" size="lg">
                  View Demo
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            >
              {stats.map((stat, index) => (
                <GlassCard key={index} className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything You Need for Field Operations
              </h2>
              <p className="text-xl text-white/70">
                Powerful features designed for modern insurance field teams
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <GlassCard
                    key={index}
                    className="p-6 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/70">
                      {feature.description}
                    </p>
                  </GlassCard>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Powerful Dashboard & Analytics
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Get real-time insights into your field operations
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="relative"
            >
              <GlassCard className="p-2">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 text-primary mx-auto mb-4" />
                    <p className="text-white/70">Dashboard Preview</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Field Operations?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Join hundreds of insurance companies already using CS Field Pulse
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="flex items-center gap-2">
                    Get Started Now <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="secondary" size="lg">
                  Schedule Demo
                </Button>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logos/company-symbol.png"
                alt="CS Field Pulse"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-white/70">© 2024 CS Field Pulse. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}