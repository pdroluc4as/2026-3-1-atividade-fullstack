"use client";

import { useEffect, useState } from "react";

import api, { ApiError } from "@/shared/lib/api";

type PostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
};

type CommentItem = {
  id?: number;
  postId?: number;
  authorId?: number;
  content?: string;
  createdAt?: string | number | Date;
};

type RatingItem = {
  id?: number;
  postId?: number;
  userId?: number;
  rating?: number;
  createdAt?: string | number | Date;
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

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [postsResponse, commentsData] = await Promise.all([
          api.get<{ data: PostItem[] }>("/posts?limit=100"),
          api.get<CommentItem[]>("/comments"),
        ]);
        const postsData = postsResponse.data;

        const currentUserId = getCurrentUserId();

        const ratingsByPost = await Promise.all(
          postsData.map(async (post) =>
            api.get<RatingItem[]>(`/ratings/post/${post.id}`),
          ),
        );

        const allRatings = ratingsByPost.flat();

        setPosts(
          currentUserId
            ? postsData.filter(
                (post) => Number(post.authorId) === Number(currentUserId),
              )
            : [],
        );
        setComments(
          currentUserId
            ? commentsData.filter(
                (comment) => Number(comment.authorId) === Number(currentUserId),
              )
            : [],
        );
        setRatings(
          currentUserId
            ? allRatings.filter(
                (rating) => Number(rating.userId) === Number(currentUserId),
              )
            : [],
        );
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Carregando dados do dashboard...
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
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Visão geral
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Dashboard
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Posts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {posts.length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Comentários</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {comments.length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Avaliações</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {ratings.length}
          </p>
        </div>
      </div>
    </main>
  );
}
