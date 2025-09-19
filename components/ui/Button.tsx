'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

export function Button({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  ...props 
}: ButtonProps) {
  const variants = {
    default: 'glass-button',
    primary: 'glass-button-primary',
    secondary: 'glass-button bg-orange-500/20 border-orange-500/30 text-orange-500 hover:bg-orange-500/30 hover:border-orange-500/50',
    danger: 'glass-button bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30 hover:border-red-500/50',
    ghost: 'glass-button bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      className={cn(
        variants[variant],
        sizes[size],
        'inline-flex items-center justify-center gap-2 font-medium transition-all',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}