import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/libsql';
import { commentsTable, postRatingsTable, postsTable, usersTable } from './schema.js';

export const DRIZZLE = 'DRIZZLE';

const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const url = process.env.DB_FILE_NAME ?? 'file:local.db';

    return drizzle({
      connection: url,
      schema: { usersTable, postsTable, commentsTable, postRatingsTable },
    } as any);
  },
};

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DrizzleModule {}