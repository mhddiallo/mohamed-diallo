export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)

export const otherLocale = (locale: Locale): Locale => (locale === 'fr' ? 'en' : 'fr')

/**
 * Section routes. The key is the internal folder name under app/[locale]/,
 * the values are the public, translated URL segments.
 */
export const routes = {
  about: { fr: 'a-propos', en: 'about' },
  articles: { fr: 'articles', en: 'articles' },
  map: { fr: 'carte', en: 'map' },
  interests: { fr: 'interets', en: 'interests' },
  goals: { fr: 'objectifs', en: 'goals' },
  notes: { fr: 'notes', en: 'notes' },
} as const

export type RouteKey = keyof typeof routes

/** Builds a public URL: href('fr', 'about') -> /fr/a-propos */
export const href = (locale: Locale, key?: RouteKey, ...rest: (string | number)[]): string => {
  const parts: string[] = [locale]
  if (key) parts.push(routes[key][locale])
  parts.push(...rest.map(String))
  return '/' + parts.join('/')
}

/** Maps a public segment (e.g. "carte") back to its route key ("map"). */
export const routeKeyFromSegment = (locale: Locale, segment: string): RouteKey | undefined =>
  (Object.keys(routes) as RouteKey[]).find((key) => routes[key][locale] === segment)

const dictionaries = {
  fr: {
    nav: {
      about: 'À propos',
      articles: 'Articles',
      map: 'Carte',
      interests: 'Intérêts',
      goals: 'Objectifs',
      notes: 'Notes',
    },
    switchLanguage: 'English',
    switchLanguageLabel: 'Read in English',
    home: {
      latestArticles: 'Derniers articles',
      latestNotes: 'Dernières notes',
      allArticles: 'Tous les articles',
      allNotes: 'Toutes les notes',
      mapLabel: 'La carte',
      mapTitle: (countries: number, cities: number) =>
        `${countries} pays et ${cities} villes visités`,
      exploreMap: 'Explorer la carte',
      myPath: 'Mon parcours',
    },
    articles: {
      title: 'Articles',
      intro: 'Ce que j’écris, classé par thème.',
      all: 'Tous',
      empty: 'Aucun article pour le moment.',
      readingTime: (min: number) => `${min} min de lecture`,
      back: 'Tous les articles',
    },
    map: {
      title: 'Carte',
      intro: 'Les pays et les villes où je suis allé. Cliquez sur une ville pour voir l’année.',
      all: 'Toutes',
      countries: 'Pays',
      cities: 'Villes',
      regionNear: 'Afrique & Europe',
      regionWorld: 'Monde',
      byYear: 'Voyages par année',
      empty: 'Aucun lieu pour le moment.',
    },
    interests: {
      title: 'Intérêts',
      intro: 'Ce que je lis, ce que je regarde, ce que je fais.',
      tabs: { book: 'Lectures', screen: 'Films & séries', activity: 'Activités' },
      kinds: { book: 'Livre', film: 'Film', series: 'Série', activity: 'Activité' },
      status: { current: 'En cours', done: 'Terminé', wishlist: 'À venir' },
      empty: 'Rien ici pour le moment.',
    },
    goals: {
      title: 'Objectifs',
      intro: 'Mes objectifs, par année et par domaine.',
      status: {
        planned: 'Prévu',
        in_progress: 'En cours',
        achieved: 'Atteint',
        dropped: 'Abandonné',
      },
      achievedCount: (done: number, total: number) => `${done} sur ${total} atteint${done > 1 ? 's' : ''}`,
      breakdown: { in_progress: 'en cours', planned: 'prévu', dropped: 'abandonné' },
      empty: 'Aucun objectif pour le moment.',
    },
    notes: {
      title: 'Notes',
      intro: 'Des pensées, au fil de l’eau.',
      empty: 'Aucune note pour le moment.',
    },
    about: { title: 'À propos', timeline: 'Parcours' },
    footer: 'Tous droits réservés.',
    footerMessage: 'À bientôt, ba beneen yoon.',
    notFound: 'Page introuvable.',
    dateLocale: 'fr-FR',
  },
  en: {
    nav: {
      about: 'About',
      articles: 'Articles',
      map: 'Map',
      interests: 'Interests',
      goals: 'Goals',
      notes: 'Notes',
    },
    switchLanguage: 'Français',
    switchLanguageLabel: 'Lire en français',
    home: {
      latestArticles: 'Latest articles',
      latestNotes: 'Latest notes',
      allArticles: 'All articles',
      allNotes: 'All notes',
      mapLabel: 'The map',
      mapTitle: (countries: number, cities: number) =>
        `${countries} countries and ${cities} cities visited`,
      exploreMap: 'Explore the map',
      myPath: 'My background',
    },
    articles: {
      title: 'Articles',
      intro: 'What I write, by theme.',
      all: 'All',
      empty: 'No articles yet.',
      readingTime: (min: number) => `${min} min read`,
      back: 'All articles',
    },
    map: {
      title: 'Map',
      intro: 'The countries and cities I have been to. Click a city to see the year.',
      all: 'All',
      countries: 'Countries',
      cities: 'Cities',
      regionNear: 'Africa & Europe',
      regionWorld: 'World',
      byYear: 'Trips by year',
      empty: 'No places yet.',
    },
    interests: {
      title: 'Interests',
      intro: 'What I read, what I watch, what I do.',
      tabs: { book: 'Reading', screen: 'Films & series', activity: 'Activities' },
      kinds: { book: 'Book', film: 'Film', series: 'Series', activity: 'Activity' },
      status: { current: 'In progress', done: 'Finished', wishlist: 'Up next' },
      empty: 'Nothing here yet.',
    },
    goals: {
      title: 'Goals',
      intro: 'My goals, by year and by domain.',
      status: {
        planned: 'Planned',
        in_progress: 'In progress',
        achieved: 'Achieved',
        dropped: 'Dropped',
      },
      achievedCount: (done: number, total: number) => `${done} of ${total} achieved`,
      breakdown: { in_progress: 'in progress', planned: 'planned', dropped: 'dropped' },
      empty: 'No goals yet.',
    },
    notes: {
      title: 'Notes',
      intro: 'Thoughts, as they come.',
      empty: 'No notes yet.',
    },
    about: { title: 'About', timeline: 'Background' },
    footer: 'All rights reserved.',
    footerMessage: 'See you soon, ba beneen yoon.',
    notFound: 'Page not found.',
    dateLocale: 'en-GB',
  },
}

export const t = (locale: Locale) => dictionaries[locale] ?? dictionaries[defaultLocale]

export const formatDate = (
  value: string | null | undefined,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string => (value ? new Intl.DateTimeFormat(t(locale).dateLocale, opts).format(new Date(value)) : '')
