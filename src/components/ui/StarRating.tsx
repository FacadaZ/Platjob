import { Star } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const SIZE_MAP = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  return (
    <div className={clsx("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={clsx(
            SIZE_MAP[size],
            i < Math.floor(rating) ? "star-filled fill-current" : "star-empty"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm font-semibold text-text-primary">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
