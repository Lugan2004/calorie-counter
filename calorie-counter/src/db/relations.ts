import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    meals: r.many.mealsTable(),
  },
  mealsTable: {
    user: r.one.usersTable({
      from: r.mealsTable.userId,
      to: r.usersTable.id,
    }),
  },
}));