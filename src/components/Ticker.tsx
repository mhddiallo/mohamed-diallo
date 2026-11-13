/** Scrolling "what I'm doing now" banner shown above the header. */
export function Ticker({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null
  // The list is rendered twice so the loop is seamless (the track moves by -50%).
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined}>
      {items.map((text, i) => (
        <li key={i}>{text}</li>
      ))}
    </ul>
  )
  const duration = Math.max(20, items.join(' ').length * 0.28)
  return (
    <div className="ticker" role="region" aria-label={label}>
      <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
        {run(false)}
        {run(true)}
      </div>
    </div>
  )
}
