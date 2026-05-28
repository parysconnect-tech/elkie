import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Four blurred, color-tinted blobs that drift around the hero on the
 * float1–4 keyframes from the v1 stylesheet. They sit behind the mesh
 * gradient but in front of the particle canvas, creating depth.
 */
export function FloatingShapes() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[10%] top-[12%] h-72 w-72 rounded-full opacity-30 animate-float1"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--accent), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute right-[8%] top-[20%] h-80 w-80 rounded-full opacity-25 animate-float2"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--accent2), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute bottom-[12%] left-[20%] h-60 w-60 rounded-full opacity-25 animate-float3"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--accent2), transparent 70%)',
          filter: 'blur(45px)',
        }}
      />
      <div
        className="absolute bottom-[18%] right-[15%] h-64 w-64 rounded-full opacity-20 animate-float4"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
    </div>
  )
}
