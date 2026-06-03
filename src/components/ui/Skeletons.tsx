import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const radiusMap = { sm: "rounded", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" };
  return (
    <div
      className={clsx(
        "bg-gray-200 animate-pulse relative overflow-hidden",
        radiusMap[rounded],
        className
      )}
    />
  );
}

/** Card skeleton for technician cards */
export function TechnicianCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-brand-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 flex-1" rounded="lg" />
        <Skeleton className="h-8 w-8" rounded="lg" />
      </div>
    </div>
  );
}

/** Grid of technician card skeletons */
export function TechnicianGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TechnicianCardSkeleton key={i} />
      ))}
    </div>
  );
}
