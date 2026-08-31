import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { postRatingsTable } from '../db/schema.js';

@Injectable()
export class RatingService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findAll() {
    return this.db.select().from(postRatingsTable).all();
  }

  async findById(id: number) {
    return this.db.select().from(postRatingsTable).where(eq(postRatingsTable.id, id)).get();
  }

  async findByPost(postId: number) {
    return this.db.select().from(postRatingsTable).where(eq(postRatingsTable.postId, postId)).all();
  }

  async findByUserAndPost(postId: number, userId: number) {
    return this.db
      .select()
      .from(postRatingsTable)
      .where(and(eq(postRatingsTable.postId, postId), eq(postRatingsTable.userId, userId)))
      .get();
  }

  async create(data: { postId: number; userId: number; rating: number }) {
    const existingRating = await this.findByUserAndPost(data.postId, data.userId);

    if (existingRating) {
      throw new ConflictException('Você já avaliou este post');
    }

    return this.db
      .insert(postRatingsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .run();
  }

  async update(id: number, data: { rating: number }) {
    return this.db
      .update(postRatingsTable)
      .set({
        ...data,
      })
      .where(eq(postRatingsTable.id, id))
      .run();
  }

  async remove(id: number) {
    return this.db.delete(postRatingsTable).where(eq(postRatingsTable.id, id)).run();
  }
}
