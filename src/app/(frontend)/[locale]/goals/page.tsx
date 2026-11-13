import type { Metadata } from 'next'
import Link from 'next/link'
import type { Goal, GoalDomain } from '@/payload-types'
import { href, t, type Locale } from '@/lib/i18n'
import { payload } from '@/lib/payload'
import { CountUp } from '@/components/motion/CountUp'
import { Interpolate } from '@/components/motion/Interpolate'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ year?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).goals.title }
}

export default async function GoalsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { year: yearParam } = await searchParams
  const dict = t(locale)

  const all = await (await payload()).find({
    collection: 'goals',
    locale,
    limit: 1000,
    pagination: false,
    depth: 1,
  })

  const years = [...new Set(all.docs.map((g) => g.year))].sort((a, b) => a - b)
  const currentYear = new Date().getFullYear()
  const fallbackYear = years.includes(currentYear) ? currentYear : years[years.length - 1]
  const year = years.includes(Number(yearParam)) ? Number(yearParam) : fallbackYear
  const goals = all.docs.filter((g) => g.year === year)

  // Group by domain, respecting the domain display order
  const groups = new Map<number, { domain: GoalDomain; goals: Goal[] }>()
  for (const goal of goals) {
    const domain = goal.domain as GoalDomain
    if (!groups.has(domain.id)) groups.set(domain.id, { domain, goals: [] })
    groups.get(domain.id)!.goals.push(goal)
  }
  const sortedGroups = [...groups.values()].sort(
    (a, b) => (a.domain.order ?? 0) - (b.domain.order ?? 0),
  )

  const count = (s: Goal['status']) => goals.filter((g) => g.status === s).length
  const achieved = count('achieved')
  const breakdown = (['in_progress', 'planned', 'dropped'] as const)
    .map((s) => [count(s), dict.goals.breakdown[s]] as const)
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${n} ${label}`)
    .join(' · ')
  const base = href(locale, 'goals')

  return (
    <>
      <section className="page-head">
        <h1>{dict.goals.title}</h1>
        <p className="lede">{dict.goals.intro}</p>
      </section>

      {years.length === 0 ? (
        <p className="empty">{dict.goals.empty}</p>
      ) : (
        <>
          <nav className="segmented year-switch" aria-label={dict.goals.title}>
            {years.map((y) => (
              <Link key={y} href={`${base}?year=${y}`} aria-current={y === year ? 'true' : undefined}>
                {y}
              </Link>
            ))}
          </nav>

          <div className="goal-summary">
            <p className="goal-summary-title">
              <Interpolate
                text={dict.goals.achievedCount}
                values={{ done: <CountUp value={achieved} />, total: goals.length }}
              />
            </p>
            <div className="bar bar-ocre">
              <span style={{ width: `${goals.length ? (achieved / goals.length) * 100 : 0}%` }} />
            </div>
            {breakdown && <p className="goal-summary-sub">{breakdown}</p>}
          </div>

          <div className="goal-groups">
            {sortedGroups.map(({ domain, goals }) => (
              <section key={domain.id} className="goal-group">
                <h2>
                  {domain.icon && <span aria-hidden>{domain.icon} </span>}
                  {domain.name}
                </h2>
                <ul>
                  {goals.map((goal) => {
                    const hasTarget = typeof goal.target === 'number' && goal.target > 0
                    const current = goal.current ?? 0
                    const pct = hasTarget ? Math.min(100, (current / goal.target!) * 100) : 0
                    return (
                      <li key={goal.id} className={`goal goal-${goal.status}`}>
                        <div className="goal-line">
                          <h3>{goal.title}</h3>
                          <span className={`pill pill-${goal.status}`}>
                            {dict.goals.status[goal.status]}
                          </span>
                        </div>
                        {hasTarget && (
                          <div className="goal-progress">
                            <div
                              className="bar bar-baobab"
                              role="progressbar"
                              aria-valuenow={current}
                              aria-valuemin={0}
                              aria-valuemax={goal.target!}
                            >
                              <span style={{ width: `${pct}%` }} />
                            </div>
                            <em>
                              {current} / {goal.target}
                            </em>
                          </div>
                        )}
                        {goal.description && <p className="goal-desc">{goal.description}</p>}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  )
}
