"use client";

function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block leading-none">
      <span className="text-muted" aria-hidden>
        ★
      </span>
      <span
        className="absolute inset-0 overflow-hidden text-accent"
        style={{ width: `${fill * 100}%` }}
        aria-hidden
      >
        ★
      </span>
    </span>
  );
}

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number; // 0-10
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}) {
  const sizeClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  function handleClick(e: React.MouseEvent<HTMLButtonElement>, star: number) {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    const newValue = isHalf ? star * 2 - 1 : star * 2;
    onChange(newValue === value ? 0 : newValue);
  }

  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, (value - (star - 1) * 2) / 2));
        return readOnly ? (
          <Star key={star} fill={fill} />
        ) : (
          <button
            key={star}
            type="button"
            onClick={(e) => handleClick(e, star)}
            className="cursor-pointer transition hover:scale-110"
            aria-label={`Rate ${star} of 5 stars`}
          >
            <Star fill={fill} />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-1.5 text-xs font-medium text-muted">
          {(value / 2).toFixed(1)}
        </span>
      )}
    </div>
  );
}
