"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api, { ApiError } from "@/shared/lib/api";
import { PostDetailHeader } from "@/features/posts/components/post-detail-header";
import { RatingSection } from "@/features/posts/components/rating-section";
import { CommentSection } from "@/features/posts/components/comment-section";

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
  parentCommentId?: number | null;
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

type UserItem = {
  id: number;
  username?: string;
  fullName?: string;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params?.id ?? 0);

  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPostDetails() {
      if (!postId) {
        router.replace("/login");
        return;
      }

      try {
        const [postData, commentsData, ratingsData, usersData] =
          await Promise.all([
            api.get<PostItem>(`/posts/${postId}`),
            api.get<CommentItem[]>(`/comments?postId=${postId}`),
            api.get<RatingItem[]>(`/ratings/post/${postId}`),
            api.get<UserItem[]>("/users"),
          ]);

        setPost(postData);
        setComments(commentsData);
        setRatings(ratingsData);
        setUsers(usersData);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar este post.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPostDetails();
  }, [postId, router]);

  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;

    const total = ratings.reduce(
      (sum, item) => sum + Number(item.rating ?? 0),
      0,
    );
    return total / ratings.length;
  }, [ratings]);

  async function handleCommentSubmit(content: string, parentCommentId?: number) {
    const trimmedComment = content.trim();
    if (!trimmedComment) {
      setError("Escreva um comentário antes de enviar.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Você precisa estar autenticado para comentar.");
      return;
    }

    setSubmittingComment(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/comments", {
        postId,
        content: trimmedComment,
        ...(parentCommentId !== undefined ? { parentCommentId } : {}),
      });

      const nextComments = await api.get<CommentItem[]>(
        `/comments?postId=${postId}`,
      );
      setComments(nextComments);
      if (!parentCommentId) {
        setComment("");
      }
      setSuccess("Comentário enviado com sucesso.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o comentário.";
      setError(message);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleRatingSubmit() {
    if (!selectedRating) {
      setError("Selecione uma avaliação de 1 a 5.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Você precisa estar autenticado para avaliar.");
      return;
    }

    setSubmittingRating(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/ratings", { postId, rating: Number(selectedRating) });

      const nextRatings = await api.get<RatingItem[]>(
        `/ratings/post/${postId}`,
      );
      setRatings(nextRatings);
      setSuccess("Avaliação enviada com sucesso.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a avaliação.";
      setError(message);
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Carregando publicação...
        </div>
      </main>
    );
  }

  if (error && !post) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  const author = users.find(
    (user) => Number(user.id) === Number(post?.authorId),
  );
  const authorName = author?.username || author?.fullName || "Usuário";

  return (
    <main className="p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Voltar
        </button>

        {post ? (
          <PostDetailHeader
            post={post}
            authorName={authorName}
            averageRating={averageRating}
            ratingsCount={ratings.length}
            commentsCount={comments.length}
          />
        ) : null}

        <RatingSection
          selectedRating={selectedRating}
          hoverRating={hoverRating}
          submitting={submittingRating}
          onSelect={setSelectedRating}
          onHover={setHoverRating}
          onSubmit={handleRatingSubmit}
        />

        <CommentSection
          comments={comments}
          users={users}
          ratings={ratings}
          comment={comment}
          submitting={submittingComment}
          error={error}
          success={success}
          onCommentChange={setComment}
          onSubmit={handleCommentSubmit}
        />
      </div>
    </main>
  );
}
