import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { estimateCalories } from '../libs/calorieEstimate'
import { addMeal, getDashboardData } from '../libs/calorieData'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const queryClient = useQueryClient()
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [meal, setMeal] = useState('')
  const estimation = useMutation({
    mutationFn: (mealText: string) =>
      estimateCalories({ data: { meal: mealText } }),
  })
  const saveMeal = useMutation({
    mutationFn: (calories: number) =>
      addMeal({ data: { userId: selectedId!, meal, calories } }),
    onSuccess: () => {
      setMeal('')
      estimation.reset()
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const users = dashboard.data?.users ?? []
  const activeId = selectedId ?? users[0]?.id
  const activeUser = users.find((user) => user.id === activeId)
  const meals =
    dashboard.data?.meals.filter((item) => item.userId === activeId) ?? []
  const consumed = useMemo(
    () => meals.reduce((sum, item) => sum + item.calories, 0),
    [meals],
  )
  const remaining = (activeUser?.calorieGoal ?? 0) - consumed
  const progress = activeUser
    ? Math.min(100, Math.round((consumed / activeUser.calorieGoal) * 100))
    : 0

  const estimate = () => {
    if (!meal.trim()) return
    estimation.mutate(meal)
  }
  return (
    <main className="page-shell">
      <header className="topbar">
        <a href="/" className="brand">
          daily<span>fuel</span>
        </a>
        <nav>
          <a href="/analytics" className="nav-link">
            Analytics
          </a>
        </nav>
      </header>
      <section className="hero">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString('en', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1>Good to see you, {activeUser?.name ?? 'there'}.</h1>
          <p className="muted">Keep it simple. Keep it moving.</p>
        </div>
        <div
          className="profile-switcher"
          role="group"
          aria-label="Choose profile"
        >
          {users.map((user) => (
            <button
              key={user.id}
              className={`profile-chip ${user.id === activeId ? 'active' : ''}`}
              onClick={() => setSelectedId(user.id)}
            >
              <span className="avatar">{user.name.charAt(0)}</span>
              {user.name}
            </button>
          ))}
        </div>
      </section>
      <section className="summary-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Today&apos;s calories</p>
              <h2>
                {consumed.toLocaleString()}{' '}
                <span>
                  / {activeUser?.calorieGoal.toLocaleString() ?? '—'} kcal
                </span>
              </h2>
            </div>
            <strong className="progress-percent">{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-caption">
            {!activeUser
              ? 'Add a profile to start tracking.'
              : remaining > 0
                ? `${remaining.toLocaleString()} kcal to go`
                : remaining === 0
                  ? 'Goal reached. Nicely done.'
                  : `${Math.abs(remaining).toLocaleString()} kcal over your goal`}
          </p>
          {activeUser && remaining <= 0 && (
            <div className="congrats">Daily goal reached. You did it.</div>
          )}
        </div>
        <div className="panel quick-stat">
          <p className="eyebrow">Meals logged</p>
          <strong>{meals.length}</strong>
          <p className="muted">
            for {activeUser?.name ?? 'your profile'} today
          </p>
        </div>
      </section>
      <section className="content-grid">
        <div className="panel estimator">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">AI estimator</p>
              <h2>What did you eat?</h2>
            </div>
            <span className="status-dot">Ready</span>
          </div>
          <div className="meal-form">
            <input
              value={meal}
              onChange={(event) => setMeal(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                )
                  estimate()
              }}
              placeholder="e.g. two eggs and toast"
              aria-label="Meal description"
            />
            <button
              className="button button-dark"
              onClick={estimate}
              disabled={estimation.isPending}
            >
              {estimation.isPending ? 'Estimating…' : 'Estimate'}
            </button>
          </div>
          {estimation.isError && (
            <p className="error-text">
              We couldn&apos;t estimate that. Please try again.
            </p>
          )}
          {estimation.data && (
            <div className="estimate-result">
              <div>
                <span className="eyebrow">Estimated total</span>
                <strong>{estimation.data.calories} kcal</strong>
              </div>
              <button
                className="button button-light"
                onClick={() => saveMeal.mutate(estimation.data.calories)}
                disabled={saveMeal.isPending}
              >
                {saveMeal.isPending ? 'Adding…' : 'Add to today'}
              </button>
            </div>
          )}
        </div>
        <div className="panel meals-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Today&apos;s log</p>
              <h2>Recent meals</h2>
            </div>
            <span className="metric">{consumed} kcal</span>
          </div>
          {meals.length === 0 ? (
            <p className="empty-state">
              No meals yet. Your first entry starts the day.
            </p>
          ) : (
            <div className="meal-list">
              {meals.map((item) => (
                <div className="meal-row" key={item.id}>
                  <span>{item.meal}</span>
                  <strong>{item.calories} kcal</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
