import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, lt } from 'drizzle-orm'
import { db } from '../db'
import { mealsTable, usersTable } from '../db/schema'

function dayRange(date = new Date()) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export const getDashboardData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const users = await db.select().from(usersTable).orderBy(usersTable.id)
    const { start, end } = dayRange()
    const meals = await db
      .select()
      .from(mealsTable)
      .where(
        and(gte(mealsTable.createdAt, start), lt(mealsTable.createdAt, end)),
      )
      .orderBy(desc(mealsTable.createdAt))

    return { users, meals }
  },
)

export const addMeal = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; meal: string; calories: number }) => data)
  .handler(async ({ data }) => {
    if (
      !Number.isInteger(data.userId) ||
      !data.meal.trim() ||
      !Number.isInteger(data.calories) ||
      data.calories <= 0
    ) {
      throw new Error('Invalid meal')
    }
    const [created] = await db
      .insert(mealsTable)
      .values({
        userId: data.userId,
        meal: data.meal.trim(),
        calories: data.calories,
      })
      .returning()
    return created
  })

export const getWeeklyData = createServerFn({ method: 'POST' })
  .validator((data: { userId: number }) => data)
  .handler(async ({ data }) => {
    const end = new Date()
    end.setHours(24, 0, 0, 0)
    const start = new Date(end)
    start.setDate(start.getDate() - 7)
    return db
      .select()
      .from(mealsTable)
      .where(
        and(
          eq(mealsTable.userId, data.userId),
          gte(mealsTable.createdAt, start),
          lt(mealsTable.createdAt, end),
        ),
      )
      .orderBy(mealsTable.createdAt)
  })
