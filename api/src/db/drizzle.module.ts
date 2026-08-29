import { Global, Module } from '@nestjs/common';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { usersTable } from './schema.js';

export const DRIZZLE = 'DRIZZLE';

const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const url = process.env.DB_FILE_NAME ?? 'file:local.db';
    const client = createClient({ url });

    return drizzle({ client, schema: { usersTable } });
  },
};

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DrizzleModule {}
