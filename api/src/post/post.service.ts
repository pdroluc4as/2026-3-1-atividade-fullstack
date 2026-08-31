import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { postsTable } from '../db/schema.js';

@Injectable()
export class PostService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findAll() {
    return this.db.select().from(postsTable).all();
  }

  async findById(id: number) {
    return this.db.select().from(postsTable).where(eq(postsTable.id, id)).get();
  }

  async create(data: { authorId: number; title: string; content: string }) {
    return this.db
      .insert(postsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .run();
  }

  async update(id: number, data: { title?: string; content?: string }) {
    return this.db
      .update(postsTable)
      .set({
        ...data,
      })
      .where(eq(postsTable.id, id))
      .run();
  }

  async remove(id: number) {
    return this.db.delete(postsTable).where(eq(postsTable.id, id)).run();
  }
}
