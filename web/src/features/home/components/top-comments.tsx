import Link from "next/link";
import { MessageSquareText, Star, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "@/shared/lib/api";

type CommentAuthor = {
  id: number;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
};

type TopComment = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string | number | Date;
  author?: CommentAuthor;
  userRating?: number; // avaliação do autor desse post
};

type RatingItem = {
  userId: number;
  rating: number;
};

type RawComment = {
  id: number;
  postId: number;
  authorId: number;
  content?: string;
  createdAt?: string | number | Date;
};

async function fetchTopComments(): Promise<TopComment[]> {
  try {
    // Busca posts (com author e ratings) e todos os comentários
    const [postsRes, commentsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/posts?limit=100`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE_URL}/comments`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE_URL}/users`, { next: { revalidate: 60 } }),
    ]);

    if (!postsRes.ok || !commentsRes.ok || !usersRes.ok) return [];

    const postsPayload: { data: Array<{ id: number; ratings?: RatingItem[] }> } =
      await postsRes.json();
    const comments: RawComment[] = await commentsRes.json();
    const users: CommentAuthor[] = await usersRes.json();

    // Mapeia postId -> ratings
    const ratingsMap = new Map<number, RatingItem[]>();
    for (const post of postsPayload.data) {
      ratingsMap.set(post.id, post.ratings ?? []);
    }

    // Para cada comentário, calcula a avaliação do autor naquele post
    const scored = comments.map((c) => {
      const ratings = ratingsMap.get(c.postId) ?? [];
      const authorRating = ratings.find((r) => r.userId === c.authorId);
      const score = authorRating?.rating ?? 0;
      const author = users.find((u) => u.id === c.authorId);
      return { ...c, userRating: score, author };
    });

    // Ordena por avaliação DESC, pega top 3
    scored.sort((a, b) => b.userRating - a.userRating);
    return scored.slice(0, 3) as TopComment[];
  } catch {
    return [];
  }
}

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "Hoje";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Hoje";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export async function TopComments() {
  const comments = await fetchTopComments();

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Top comentários
        </h2>
      </div>

      {comments.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhum comentário ainda.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c, idx) => {
            const authorName =
              c.author?.username || c.author?.fullName || "Usuário";
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <li key={c.id}>
                <Link
                  href={`/posts/${c.postId}`}
                  className="block rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  {/* Rank + autor */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    {c.author?.avatarUrl ? (
                      <img
                        src={c.author.avatarUrl}
                        alt={authorName}
                        className="h-6 w-6 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                        {initial}
                      </span>
                    )}
                    <span className="truncate text-xs font-semibold text-slate-700">
                      {authorName}
                    </span>
                  </div>

                  {/* Conteúdo do comentário */}
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                    {c.content}
                  </p>

                  {/* Rodapé: avaliação + data */}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {c.userRating}/5
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquareText className="h-3 w-3" />
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

