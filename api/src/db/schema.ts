import { relations, InferSelectModel } from "drizzle-orm";
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
  (table) => ({
    uniqueUserPost: uniqueIndex("post_ratings_unique_user_post").on(table.postId, table.userId),
  }),
);

export type User = InferSelectModel<typeof usersTable>;
export type Post = InferSelectModel<typeof postsTable>;
export type Comment = InferSelectModel<typeof commentsTable>;
export type PostRating = InferSelectModel<typeof postRatingsTable>;

export const usersRelations = relations(usersTable, (helpers: any) => ({
  posts: helpers.many(postsTable),
  comments: helpers.many(commentsTable),
  postRatings: helpers.many(postRatingsTable),
}));

export const postsRelations = relations(postsTable, (helpers: any) => ({
  author: helpers.one(usersTable, {
    fields: [postsTable.authorId],
    references: [usersTable.id],
  }),
  comments: helpers.many(commentsTable),
  ratings: helpers.many(postRatingsTable),
}));

export const commentsRelations = relations(commentsTable, (helpers: any) => ({
  post: helpers.one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  author: helpers.one(usersTable, {
    fields: [commentsTable.authorId],
    references: [usersTable.id],
  }),
  parentComment: helpers.one(commentsTable, {
    fields: [commentsTable.parentCommentId],
    references: [commentsTable.id],
    relationName: "parent_child_comments",
  }),
  replies: helpers.many(commentsTable, { relationName: "parent_child_comments" }),
}));

export const postRatingsRelations = relations(postRatingsTable, (helpers: any) => ({
  post: helpers.one(postsTable, {
    fields: [postRatingsTable.postId],
    references: [postsTable.id],
  }),
  user: helpers.one(usersTable, {
    fields: [postRatingsTable.userId],
    references: [usersTable.id],
  }),
}));
