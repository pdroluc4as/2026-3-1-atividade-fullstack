import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { postsTable } from '../db/schema.js';

@Injectable()
export class PostService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      this.db.query.postsTable.findMany({
        with: {
          author: true,
          comments: true,
          ratings: true,
        },
        orderBy: (posts: any, { desc }: any) => [desc(posts.createdAt)],
        limit,
        offset,
      }),
      this.db.select({ count: sql`count(*)` }).from(postsTable).get()
    ]);

    return {
      data: posts,
      meta: {
        total: totalCount.count as number,
        page,
        limit,
        totalPages: Math.ceil((totalCount.count as number) / limit),
      }
    };
  }

  async findById(id: number) {
    return this.db.query.postsTable.findFirst({
      where: eq(postsTable.id, id),
      with: {
        author: true,
        comments: true,
        ratings: true,
      },
    });
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
