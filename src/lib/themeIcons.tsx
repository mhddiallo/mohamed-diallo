import {
  BookOpen,
  Briefcase,
  Code,
  Compass,
  Fingerprint,
  Globe,
  HeartPulse,
  Landmark,
  Layers,
  Lightbulb,
  Network,
  Plane,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/** Icons offered for article themes (value stored in the database → component). */
export const themeIcons: Record<string, { icon: LucideIcon; fr: string; en: string }> = {
  sparkles: { icon: Sparkles, fr: 'Étincelles (IA)', en: 'Sparkles (AI)' },
  landmark: {
    icon: Landmark,
    fr: 'Institution (politiques publiques)',
    en: 'Institution (public policy)',
  },
  fingerprint: {
    icon: Fingerprint,
    fr: 'Empreinte (identité numérique)',
    en: 'Fingerprint (digital identity)',
  },
  network: { icon: Network, fr: 'Réseau (interopérabilité)', en: 'Network (interoperability)' },
  wallet: {
    icon: Wallet,
    fr: 'Portefeuille (paiements, finance)',
    en: 'Wallet (payments, finance)',
  },
  code: { icon: Code, fr: 'Code (ingénierie)', en: 'Code (engineering)' },
  briefcase: { icon: Briefcase, fr: 'Mallette (carrière)', en: 'Briefcase (career)' },
  'trending-up': { icon: TrendingUp, fr: 'Courbe (croissance)', en: 'Trend (growth)' },
  target: { icon: Target, fr: 'Cible (productivité)', en: 'Target (productivity)' },
  'heart-pulse': { icon: HeartPulse, fr: 'Pouls (sport, santé)', en: 'Pulse (sport, health)' },
  plane: { icon: Plane, fr: 'Avion (voyages)', en: 'Plane (travel)' },
  globe: { icon: Globe, fr: 'Globe (Afrique, monde)', en: 'Globe (Africa, world)' },
  'book-open': { icon: BookOpen, fr: 'Livre (lectures)', en: 'Book (reading)' },
  lightbulb: { icon: Lightbulb, fr: 'Ampoule (idées)', en: 'Light bulb (ideas)' },
  compass: { icon: Compass, fr: 'Boussole (réflexions)', en: 'Compass (reflections)' },
  layers: { icon: Layers, fr: 'Calques (général)', en: 'Layers (general)' },
}

export const themeIconOptions = Object.entries(themeIcons).map(([value, { fr, en }]) => ({
  value,
  label: { fr, en },
}))

export function ThemeIcon({ name, size = 18 }: { name?: string | null; size?: number }) {
  const Icon = themeIcons[name ?? '']?.icon ?? Layers
  return <Icon size={size} strokeWidth={1.8} aria-hidden />
}
