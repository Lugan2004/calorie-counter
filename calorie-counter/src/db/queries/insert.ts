import { db } from '../index';
import type { InsertUser } from '../schema';
import { usersTable } from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

