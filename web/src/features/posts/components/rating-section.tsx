import { Star } from "lucide-react";

type RatingSectionProps = {
  selectedRating: number;
  hoverRating: number;
  submitting: boolean;
  onSelect: (value: number) => void;
  onHover: (value: number) => void;
  onSubmit: () => void;
};

export function RatingSection({
  selectedRating,
  hoverRating,
  submitting,
  onSelect,
  onHover,
  onSubmit,
}: RatingSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Avaliar publicação</h2>

      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= (hoverRating || selectedRating);

          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => onHover(value)}
              onMouseLeave={() => onHover(0)}
              onClick={() => onSelect(value)}
              className={`rounded-full border p-2 transition ${
                isFilled
                  ? "border-amber-400 bg-amber-50 text-amber-500"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
              }`}
              aria-label={`Avaliar com ${value} estrela${value > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-5 w-5 ${isFilled ? "fill-current" : "fill-transparent"}`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !selectedRating}
        className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
      >
        {submitting ? "Enviando..." : "Enviar avaliação"}
      </button>
    </section>
  );
}

