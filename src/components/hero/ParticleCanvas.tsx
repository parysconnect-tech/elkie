import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
}

type Props = {
  /** How many particles to keep alive */
  count?: number
  /** className on the wrapping canvas */
  className?: string
}

/**
 * Drifting upward particles tinted with the active accent color.
 * Reads `--particle` ("r,g,b") from the current theme so it flips
 * between teal (dark) and coral (light) automatically.
 */
export function ParticleCanvas({ count = 60, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const spawn = (initial = false): Particle => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.15 + Math.random() * 0.45),
      size: 1 + Math.random() * 2,
      alpha: 0.15 + Math.random() * 0.55,
      life: 0,
    })

    const particles: Particle[] = Array.from({ length: count }, () => spawn(true))

    const readParticleColor = (): string => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--particle')
        .trim()
      return raw || '0, 229, 204'
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const color = readParticleColor()
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.life += 1
        const fade = Math.max(0, 1 - p.life / 600)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${p.alpha * fade})`
        ctx.fill()
        if (p.y < -10 || p.life > 600 || p.x < -10 || p.x > width + 10) {
          Object.assign(p, spawn())
        }
      }
      animationRef.current = requestAnimationFrame(draw)
    }
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [count, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'pointer-events-none absolute inset-0 h-full w-full'}
    />
  )
}
