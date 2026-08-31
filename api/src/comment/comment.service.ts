import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { commentsTable } from '../db/schema.js';

@Injectable()
export class CommentService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findAll() {
    return this.db.select().from(commentsTable).all();
  }

  async findById(id: number) {
    return this.db.select().from(commentsTable).where(eq(commentsTable.id, id)).get();
  }

  async findByPost(postId: number) {
    return this.db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).all();
  }

  async create(data: {
    postId: number;
    authorId: number;
    content: string;
    parentCommentId?: number | null;
  }) {
    return this.db
      .insert(commentsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .run();
  }

  async update(id: number, data: { content?: string; parentCommentId?: number | null }) {
    return this.db
      .update(commentsTable)
      .set({
        ...data,
      })
      .where(eq(commentsTable.id, id))
      .run();
  }

  async remove(id: number) {
    return this.db.delete(commentsTable).where(eq(commentsTable.id, id)).run();
  }
}
