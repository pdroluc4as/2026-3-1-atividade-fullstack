import { Suspense } from "react";
import Link from "next/link";
import { CreatePostBox } from "@/features/home/components/create-post-box";
import { SearchBar } from "@/features/home/components/search-bar";
import { TopComments } from "@/features/home/components/top-comments";
import { PostCard } from "@/features/posts/components/post-card";
import { API_BASE_URL } from "@/shared/lib/api";

type PostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
  author?: {
    id: number;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
  };
  comments?: Array<{
    id?: number;
    content?: string;
    authorId?: number;
    createdAt?: string | number | Date;
  }>;
  ratings?: Array<{
    id?: number;
    rating?: number;
    userId?: number;
    createdAt?: string | number | Date;
  }>;
};

type PaginatedResponse = {
  data: PostItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Next.js Server Component
export default async function Home({ searchParams }: Props) {
  let posts: PostItem[] = [];
  let meta = { totalPages: 1, page: 1 };
  let error = "";

  const resolvedParams = await searchParams;
  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const query =
    typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
  const limit = 10;

  try {
    const res = await fetch(
      `${API_BASE_URL}/posts?page=${page}&limit=${limit}`,
      {
        next: { revalidate: 0 }, // Always fetch fresh data on the server
      },
    );

    if (!res.ok) {
      throw new Error("Não foi possível carregar as postagens.");
    }

    const payload: PaginatedResponse = await res.json();

    // Filtra localmente pelo termo de pesquisa (title ou content)
    const allPosts = payload.data;
    posts = query
      ? allPosts.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.content.toLowerCase().includes(query.toLowerCase()) ||
            (p.author?.username ?? "")
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            (p.author?.fullName ?? "")
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
      : allPosts;

    meta = payload.meta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro desconhecido";
  }

  return (
    <div className="px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Layout Twitter-like: feed + sidebar */}
        <div className="flex gap-6">
          {/* ── Feed principal ── */}
          <div className="min-w-0 flex-1 space-y-6">
            <section>
              <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                Últimas discussões
              </h1>
              <CreatePostBox />
            </section>

            {/* Resultado da pesquisa */}
            {query && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>
                  Resultados para:{" "}
                  <strong className="text-white">&ldquo;{query}&rdquo;</strong>
                </span>
                <Link
                  href="/"
                  className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-600 transition"
                >
                  Limpar
                </Link>
              </div>
            )}

            <section className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                  {error}
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/40 bg-white p-8 text-center text-base text-slate-600">
                  {query
                    ? `Nenhum post encontrado para "${query}".`
                    : "Não existem postagens novas."}
                </div>
              ) : (
                posts.map((post) => {
                  const authorName =
                    post.author?.username || post.author?.fullName || "Usuário";

                  return (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title={post.title || "Sem título"}
                      description={post.content}
                      content={post.content}
                      author={authorName}
                      authorId={post.author?.id}
                      authorAvatarUrl={post.author?.avatarUrl}
                      date={formatDate(post.createdAt)}
                      category="Geral"
                      href={`/posts/${post.id}`}
                      comments={post.comments ?? []}
                      ratings={post.ratings ?? []}
                      averageRating={
                        (post.ratings?.length ?? 0) > 0
                          ? post.ratings!.reduce(
                              (sum, item) => sum + Number(item.rating ?? 0),
                              0,
                            ) / (post.ratings?.length ?? 1)
                          : 0
                      }
                    />
                  );
                })
              )}

              {/* Pagination Controls */}
              {!query && meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {meta.page > 1 ? (
                    <Link
                      href={`/?page=${meta.page - 1}`}
                      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-400 opacity-50">
                      Anterior
                    </span>
                  )}

                  <span className="text-sm font-medium text-slate-600">
                    Página {meta.page} de {meta.totalPages}
                  </span>

                  {meta.page < meta.totalPages ? (
                    <Link
                      href={`/?page=${meta.page + 1}`}
                      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Próxima
                    </Link>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-400 opacity-50">
                      Próxima
                    </span>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar direita ── */}
          <aside className="hidden w-72 shrink-0 space-y-4 xl:block">
            {/* Barra de pesquisa */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>

            {/* Top comentários */}
            <TopComments />
          </aside>
        </div>
      </div>
    </div>
  );
}
