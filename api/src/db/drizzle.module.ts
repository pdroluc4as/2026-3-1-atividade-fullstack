import { Global, Module } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { commentsTable, postRatingsTable, postsTable, usersTable } from './schema.js';

export const DRIZZLE = 'DRIZZLE';

async function initializeDatabase(db: ReturnType<typeof drizzle>) {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      bio TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS posts_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS comments_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts_table(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
      parent_comment_id INTEGER REFERENCES comments_table(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS post_ratings_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts_table(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS post_ratings_unique_user_post
    ON post_ratings_table(post_id, user_id);
  `);
}

const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: async () => {
    const url = process.env.DB_FILE_NAME ?? 'file:local.db';

    const db = drizzle({
      connection: url,
      schema: { usersTable, postsTable, commentsTable, postRatingsTable },
    } as any);

    await initializeDatabase(db);
    return db;
  },
};

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DrizzleModule {}