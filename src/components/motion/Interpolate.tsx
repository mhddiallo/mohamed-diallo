import { Fragment, type ReactNode } from 'react'

/** Replaces {placeholders} in a translated string with React nodes. */
export function Interpolate({ text, values }: { text: string; values: Record<string, ReactNode> }) {
  const parts = text.split(/(\{\w+\})/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{(\w+)\}$/)
        return <Fragment key={i}>{match ? values[match[1]] : part}</Fragment>
      })}
    </>
  )
}

/** Splits a word into letters that rise in one after another (see .split-letters). */
export function SplitLetters({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <span className="split-letters" aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden style={{ ['--i' as string]: i + offset }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
