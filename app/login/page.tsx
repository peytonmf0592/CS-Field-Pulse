'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Listen for 'd' key press to fill demo credentials
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setEmail('demo@example.com')
        setPassword('demo1234')
        toast.success('Demo credentials filled!')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check if we're in demo mode (using placeholder credentials)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const isDemoMode = supabaseUrl.includes('placeholder') || supabaseUrl === ''

    if (isDemoMode) {
      // Demo mode - bypass authentication
      toast.success('Demo Mode: Logging in without authentication')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 500)
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ParticleBackground />
      <Toaster position="top-right" />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image
                  src="/logos/company-symbol.png"
                  alt="CS Field Pulse logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                  priority
                />
                <h1 className="text-3xl font-bold gradient-text">
                  CS Field Pulse
                </h1>
              </div>
              <p className="text-white/70">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
              <div className="mt-4 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <p className="text-sm text-orange-400">
                  Demo Mode: Press 'D' to fill demo credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
