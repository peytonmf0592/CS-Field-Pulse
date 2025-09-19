'use client'

import { ReactNode } from 'react'
import { Navigation } from '@/components/Navigation'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ParticleBackground />
      <Toaster position="top-right" />
      <div className="relative min-h-screen">
        <Navigation />
        <main className="container mx-auto px-8 py-12 max-w-[1400px]">
          {children}
        </main>
      </div>
    </>
  )
}