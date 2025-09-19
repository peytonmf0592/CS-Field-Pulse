'use client'

import { useEffect, useRef } from 'react'

interface FieldMapProps {
  view: 'Map' | 'Satellite'
}

export default function FieldMap({ view }: FieldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw mock US map background
    const drawMap = () => {
      // Draw state boundaries (simplified)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 0.5

      // Mock state boundaries
      ctx.beginPath()
      ctx.moveTo(50, 100)
      ctx.lineTo(250, 90)
      ctx.lineTo(260, 180)
      ctx.lineTo(60, 190)
      ctx.closePath()
      ctx.stroke()

      // Draw some cities/points
      const points = [
        { x: 100, y: 120, heat: 0.8, label: 'Dallas' },
        { x: 180, y: 100, heat: 0.6, label: 'Houston' },
        { x: 150, y: 140, heat: 0.9, label: 'Austin' },
        { x: 200, y: 130, heat: 0.4, label: 'San Antonio' },
        { x: 80, y: 150, heat: 0.7, label: 'El Paso' },
        { x: 220, y: 110, heat: 0.5, label: 'Beaumont' },
      ]

      // Draw heat map effect
      points.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, 30
        )

        if (point.heat > 0.7) {
          gradient.addColorStop(0, 'rgba(0, 255, 136, 0.6)')
          gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.3)')
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)')
        } else if (point.heat > 0.5) {
          gradient.addColorStop(0, 'rgba(255, 204, 0, 0.6)')
          gradient.addColorStop(0.5, 'rgba(255, 204, 0, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 204, 0, 0)')
        } else {
          gradient.addColorStop(0, 'rgba(255, 68, 68, 0.6)')
          gradient.addColorStop(0.5, 'rgba(255, 68, 68, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 68, 68, 0)')
        }

        ctx.fillStyle = gradient
        ctx.fillRect(point.x - 30, point.y - 30, 60, 60)

        // Draw point
        ctx.fillStyle = point.heat > 0.7 ? '#00ff88' : point.heat > 0.5 ? '#ffcc00' : '#ff4444'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(point.label, point.x, point.y - 10)
      })

      // Draw legend
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'

      const legendY = canvas.height - 30

      ctx.fillStyle = '#00ff88'
      ctx.fillRect(10, legendY, 10, 10)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText('High', 25, legendY + 8)

      ctx.fillStyle = '#ffcc00'
      ctx.fillRect(60, legendY, 10, 10)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText('Medium', 75, legendY + 8)

      ctx.fillStyle = '#ff4444'
      ctx.fillRect(120, legendY, 10, 10)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText('Low', 135, legendY + 8)
    }

    drawMap()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawMap()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [view])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        background: view === 'Satellite'
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #0a0a0a 0%, #16213e 100%)'
      }}
    />
  )
}