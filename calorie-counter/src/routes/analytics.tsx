import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getWeeklyData } from '../libs/calorieData'
import { useState } from 'react'

export const Route = createFileRoute('/analytics')({ component: Analytics })

function Analytics() {
  const [userId] = useState(1)
  const query = useQuery({
    queryKey: ['weekly', userId],
    queryFn: () => getWeeklyData({ data: { userId } }),
  })
  const meals = query.data ?? []
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      calories: meals
        .filter(
          (meal) =>
            new Date(meal.createdAt ?? 0).toISOString().slice(0, 10) === key,
        )
        .reduce((sum, meal) => sum + meal.calories, 0),
    }
  })
  const activeDays = days.filter((day) => day.calories > 0).length
  return (
    <main className="page-shell">
      <header className="topbar">
        <a href="/" className="brand">
          daily<span>fuel</span>
        </a>
        <a href="/" className="text-link">
          Back to today
        </a>
      </header>
      <section className="analytics-header">
        <p className="eyebrow">Weekly analytics</p>
        <h1>Your consistency, at a glance.</h1>
        <p className="muted">
          A simple seven-day view of the meals you have logged.
        </p>
      </section>
      <section className="analytics-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Last 7 days</p>
              <h2>Calories logged</h2>
            </div>
            <span className="metric">{activeDays}/7 days</span>
          </div>
          <div className="bar-chart">
            {days.map((day) => (
              <div className="bar-column" key={day.label}>
                <span className="bar-value">{day.calories || '—'}</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.min(100, Math.max(5, day.calories / 25))}%`,
                    }}
                  />
                </div>
                <span className="bar-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel consistency">
          <p className="eyebrow">Consistency</p>
          <h2>
            {activeDays >= 5 ? 'You are building a habit.' : 'Keep showing up.'}
          </h2>
          <p className="muted">
            You logged meals on <strong>{activeDays} of 7</strong> days this
            week. Every entry makes your progress easier to see.
          </p>
          <a href="/" className="button button-dark">
            Log today&apos;s meal
          </a>
        </div>
      </section>
    </main>
  )
}
