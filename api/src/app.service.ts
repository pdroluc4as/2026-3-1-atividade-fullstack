import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from './db/drizzle.module.js';
import { usersTable } from './db/schema.js';

@Injectable()
export class AppService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getUsers() {
    return this.db.select().from(usersTable).all();
  }

  async getUserByEmail(email: string) {
    return this.db.select().from(usersTable).where(eq(usersTable.email, email)).get();
  }
}
