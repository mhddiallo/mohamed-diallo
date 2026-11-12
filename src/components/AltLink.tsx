'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * Lets a page tell the language switcher where its translation lives
 * (useful for articles, whose URL slug differs between languages).
 */
type Ctx = { alt: string | null; setAlt: (href: string | null) => void }
const AltLinkContext = createContext<Ctx>({ alt: null, setAlt: () => {} })

export function AltLinkProvider({ children }: { children: ReactNode }) {
  const [alt, setAlt] = useState<string | null>(null)
  return <AltLinkContext.Provider value={{ alt, setAlt }}>{children}</AltLinkContext.Provider>
}

export const useAltLink = () => useContext(AltLinkContext)

export function SetAltLink({ href }: { href: string }) {
  const { setAlt } = useAltLink()
  useEffect(() => {
    setAlt(href)
    return () => setAlt(null)
  }, [href, setAlt])
  return null
}
