"use client";

import { useEffect, useState } from "react";

import { CreatePostBox } from "@/features/home/components/create-post-box";
import { PostCard } from "@/features/posts/components/post-card";
import api, { ApiError } from "@/shared/lib/api";

type PostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
  comments?: Array<{ id?: number; content?: string; authorId?: number; createdAt?: string | number | Date }>;
  ratings?: Array<{ id?: number; rating?: number; userId?: number; createdAt?: string | number | Date }>;
};

type UserItem = {
  id: number;
  fullName?: string;
  username?: string;
};

function getCurrentUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { sub?: number; id?: number };

    return Number(payload.sub ?? payload.id ?? 0) || null;
  } catch {
    return null;
  }
}

function formatDate(value: string | number | Date | undefined) {
  if (!value) {
    return "Hoje";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Hoje";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Home() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      try {
        const [allPosts, allUsers] = await Promise.all([
          api.get<PostItem[]>("/posts"),
          api.get<UserItem[]>("/users"),
        ]);

        const currentUserId = getCurrentUserId();

        setUsers(allUsers);

        const otherUsersPosts = currentUserId
          ? allPosts.filter((post) => Number(post.authorId) !== Number(currentUserId))
          : allPosts;

        const enrichedPosts = await Promise.all(
          otherUsersPosts.map(async (post) => {
            const [comments, ratings] = await Promise.all([
              api.get<Array<{ id?: number; content?: string; authorId?: number; createdAt?: string | number | Date }>>(
                `/comments?postId=${post.id}`,
              ),
              api.get<Array<{ id?: number; rating?: number; userId?: number; createdAt?: string | number | Date }>>(
                `/ratings/post/${post.id}`,
              ),
            ]);

            return {
              ...post,
              comments,
              ratings,
            };
          }),
        );

        setPosts(
          enrichedPosts.sort(
            (first, second) =>
              new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
          ),
        );
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Não foi possível carregar as postagens.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, []);

  return (
    <div className="px-4 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            Últimas discussões
          </h1>
          <CreatePostBox />
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-primary/40 bg-white p-8 text-center text-base text-slate-600">
              Carregando postagens...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/40 bg-white p-8 text-center text-base text-slate-600">
              Não existe postagens novas.
            </div>
          ) : (
            posts.map((post) => {
              const author = users.find((user) => Number(user.id) === Number(post.authorId));
              const authorName = author?.username || author?.fullName || "Usuário";

              return (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title || "Sem título"}
                  description={post.content}
                  content={post.content}
                  author={authorName}
                  date={formatDate(post.createdAt)}
                  category="Geral"
                  href={`/posts/${post.id}`}
                  comments={post.comments ?? []}
                  ratings={post.ratings ?? []}
                  averageRating={
                    (post.ratings?.length ?? 0) > 0
                      ? post.ratings!.reduce((sum, item) => sum + Number(item.rating ?? 0), 0) /
                        (post.ratings?.length ?? 1)
                      : 0
                  }
                />
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
