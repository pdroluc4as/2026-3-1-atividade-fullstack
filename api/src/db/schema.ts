import { defineRelations, InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const postsTable = sqliteTable("posts_table", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  authorId: integer("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const commentsTable = sqliteTable("comments_table", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  parentCommentId: integer("parent_comment_id").references((): any => commentsTable.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const postRatingsTable = sqliteTable(
  "post_ratings_table",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("post_ratings_unique_user_post").on(table.postId, table.userId),
  ],
);

export type User = InferSelectModel<typeof usersTable>;
export type Post = InferSelectModel<typeof postsTable>;
export type Comment = InferSelectModel<typeof commentsTable>;
export type PostRating = InferSelectModel<typeof postRatingsTable>;

const relations = defineRelations(
  { usersTable, postsTable, commentsTable, postRatingsTable },
  (helpers) => ({
    usersTable: {
      posts: helpers.many.postsTable({
        from: [helpers.usersTable.id],
        to: [helpers.postsTable.authorId],
      }),
      comments: helpers.many.commentsTable({
        from: [helpers.usersTable.id],
        to: [helpers.commentsTable.authorId],
      }),
      postRatings: helpers.many.postRatingsTable({
        from: [helpers.usersTable.id],
        to: [helpers.postRatingsTable.userId],
      }),
    },
    postsTable: {
      author: helpers.one.usersTable({
        from: [helpers.postsTable.authorId],
        to: [helpers.usersTable.id],
      }),
      comments: helpers.many.commentsTable({
        from: [helpers.postsTable.id],
        to: [helpers.commentsTable.postId],
      }),
      ratings: helpers.many.postRatingsTable({
        from: [helpers.postsTable.id],
        to: [helpers.postRatingsTable.postId],
      }),
    },
    commentsTable: {
      post: helpers.one.postsTable({
        from: [helpers.commentsTable.postId],
        to: [helpers.postsTable.id],
      }),
      author: helpers.one.usersTable({
        from: [helpers.commentsTable.authorId],
        to: [helpers.usersTable.id],
      }),
      parentComment: helpers.one.commentsTable({
        from: [helpers.commentsTable.parentCommentId],
        to: [helpers.commentsTable.id],
      }),
      replies: helpers.many.commentsTable({
        from: [helpers.commentsTable.id],
        to: [helpers.commentsTable.parentCommentId],
      }),
    },
    postRatingsTable: {
      post: helpers.one.postsTable({
        from: [helpers.postRatingsTable.postId],
        to: [helpers.postsTable.id],
      }),
      user: helpers.one.usersTable({
        from: [helpers.postRatingsTable.userId],
        to: [helpers.usersTable.id],
      }),
    },
  }),
);

export const usersRelations = relations;
export const postsRelations = relations;
export const commentsRelations = relations;
export const postRatingsRelations = relations;
