/**
 * Decorative dots that drift slowly in the background.
 * Positions come from a seeded random generator, so the server and the
 * browser render the same thing (no hydration mismatch).
 */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

type Props = {
  count?: number
  seed?: number
  colors?: string[]
  className?: string
}

export function FloatingDots({
  count = 18,
  seed = 7,
  colors = ['var(--laterite)', 'var(--ocre)', 'var(--baobab)'],
  className = '',
}: Props) {
  const rand = seeded(seed)
  const dots = Array.from({ length: count }, (_, i) => {
    const size = 4 + Math.round(rand() * 10)
    return {
      left: `${Math.round(rand() * 100)}%`,
      top: `${Math.round(rand() * 100)}%`,
      size,
      color: colors[i % colors.length],
      opacity: 0.18 + rand() * 0.35,
      duration: 14 + Math.round(rand() * 16),
      delay: -Math.round(rand() * 20),
      dx: Math.round(rand() * 60 - 30),
      dy: Math.round(rand() * 60 - 30),
      ring: rand() > 0.75,
    }
  })

  return (
    <div className={`floating-dots ${className}`} aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className={d.ring ? 'ring' : undefined}
          style={
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              '--dot-color': d.color,
              '--dx': `${d.dx}px`,
              '--dy': `${d.dy}px`,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
