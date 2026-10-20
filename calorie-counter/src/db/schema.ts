import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  calorieGoal: integer('calorie_goal').notNull(),
});

export const mealsTable = sqliteTable('meals', {
  id: integer('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  meal: text('meal').notNull(),
  calories: integer('calories').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertMeal = typeof mealsTable.$inferInsert;
export type SelectMeal = typeof mealsTable.$inferSelect;