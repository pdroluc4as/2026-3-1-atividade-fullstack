import { type CommentData, CommentItem } from "./comment-item";

type UserData = {
  id: number;
  username?: string;
  fullName?: string;
};

type RatingData = {
  id?: number;
  postId?: number;
  userId?: number;
  rating?: number;
};

type CommentSectionProps = {
  comments: CommentData[];
  users: UserData[];
  ratings: RatingData[];
  comment: string;
  submitting: boolean;
  error: string;
  success: string;
  onCommentChange: (value: string) => void;
  onSubmit: (content: string, parentCommentId?: number) => void;
};

function buildTree(flat: CommentData[]): CommentData[] {
  const map = new Map<number, CommentData & { replies: CommentData[] }>();
  const roots: (CommentData & { replies: CommentData[] })[] = [];

  for (const c of flat) {
    if (c.id !== undefined) {
      map.set(c.id, { ...c, replies: [] });
    }
  }

  for (const c of flat) {
    if (c.id === undefined) continue;
    const node = map.get(c.id)!;
    if (c.parentCommentId) {
      const parent = map.get(c.parentCommentId);
      if (parent) {
        parent.replies.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return roots;
}

export function CommentSection({
  comments,
  users,
  ratings,
  comment,
  submitting,
  error,
  success,
  onCommentChange,
  onSubmit,
}: CommentSectionProps) {
  const tree = buildTree(comments);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Comentários</h2>

      <div className="mt-4 space-y-3">
        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          rows={4}
          placeholder="Escreva seu comentário..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSubmit(comment)}
            disabled={submitting || !comment.trim()}
            className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-secondary/60"
          >
            {submitting ? "Enviando..." : "Comentar"}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {tree.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ainda não há comentários neste post.
          </p>
        ) : (
          tree.map((item) => (
            <CommentItem
              key={item.id ?? `${item.authorId}-${item.createdAt}`}
              comment={item}
              users={users}
              ratings={ratings}
              submitting={submitting}
              onReply={(content, parentCommentId) =>
                onSubmit(content, parentCommentId)
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
