"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserPosts() {
      if (typeof window === "undefined") {
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        router.replace("/login");
        return;
      }

      try {
        const allPosts = await api.get<Array<{ id: number; authorId: number; title: string; content: string; createdAt: string | number | Date }>>("/posts");
        const userPosts = allPosts.filter((post) => Number(post.authorId) === Number(userId));

        const enrichedPosts = await Promise.all(
          userPosts.map(async (post) => {
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
          err instanceof ApiError ? err.message : "Não foi possível carregar seus posts.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadUserPosts();
  }, [router]);

  const authorName =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("fullName") ||
          window.localStorage.getItem("username") ||
          "Você")
      : "Você";

  if (loading) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Carregando seus posts...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Conteúdo
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Meus posts</h1>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Você ainda não publicou nenhum post.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => {
            const totalRatings = post.ratings?.length ?? 0;
            const averageRating =
              totalRatings > 0
                ? post.ratings!.reduce((sum, item) => sum + Number(item.rating ?? 0), 0) / totalRatings
                : 0;

            return (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title || "Sem título"}
                content={post.content}
                description={post.content}
                author={authorName}
                date={formatDate(post.createdAt)}
                category="Meu conteúdo"
                comments={post.comments ?? []}
                ratings={post.ratings ?? []}
                averageRating={averageRating}
                href={`/posts/${post.id}`}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
