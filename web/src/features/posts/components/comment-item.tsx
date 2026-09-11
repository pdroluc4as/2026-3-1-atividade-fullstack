"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export type CommentData = {
  id?: number;
  postId?: number;
  authorId?: number;
  parentCommentId?: number | null;
  content?: string;
  createdAt?: string | number | Date;
  replies?: CommentData[];
};

type UserData = {
  id: number;
  username?: string;
  fullName?: string;
};

type RatingData = {
  id?: number;
  userId?: number;
  rating?: number;
};

type CommentItemProps = {
  comment: CommentData;
  users: UserData[];
  ratings: RatingData[];
  submitting: boolean;
  onReply: (content: string, parentCommentId: number) => void;
  depth?: number;
};

const MAX_DEPTH = 4;

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "Hoje";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hoje";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function CommentItem({
  comment,
  users,
  ratings,
  submitting,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const author = users.find((u) => Number(u.id) === Number(comment.authorId));
  const authorName = author?.username || author?.fullName || "Usuário";

  const authorRating = ratings.find(
    (r) => Number(r.userId) === Number(comment.authorId),
  );
  const userRating =
    authorRating?.rating !== undefined
      ? Number(authorRating.rating)
      : undefined;

  function handleReplySubmit() {
    const trimmed = replyContent.trim();
    if (!trimmed || !comment.id) return;
    onReply(trimmed, comment.id);
    setReplyContent("");
    setShowReplyForm(false);
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-slate-200 pl-4" : ""}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {authorName}
          </span>
          <span className="text-xs text-slate-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        {userRating !== undefined && (
          <div className="mt-2 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= userRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-slate-400">{userRating}/5</span>
          </div>
        )}

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {comment.content}
        </p>

        {depth < MAX_DEPTH && (
          <button
            type="button"
            onClick={() => setShowReplyForm((prev) => !prev)}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {showReplyForm ? "Cancelar" : "Responder"}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="ml-2 mt-2 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            placeholder={`Respondendo a ${authorName}...`}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={submitting || !replyContent.trim()}
              className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-secondary/60"
            >
              {submitting ? "Enviando..." : "Responder"}
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id ?? `${reply.authorId}-${reply.createdAt}`}
              comment={reply}
              users={users}
              ratings={ratings}
              submitting={submitting}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
