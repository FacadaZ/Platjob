import { useState, useEffect } from "react";
import { Avatar, Card, CardContent } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { reviewService } from "@/services";
import { useAuthStore } from "@/store";
import type { Review } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeletons";
import { usePageTitle } from "@/hooks";
import { formatRelativeTime } from "@/utils";

export default function ReviewsPage() {
  usePageTitle("Mis Reseñas");
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    reviewService.getByClientId(user.id).then((data) => {
      setReviews(data);
      setIsLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-text-primary">Mis Reseñas</h1>
        <p className="text-text-secondary mt-1">Reseñas que has dejado a técnicos</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-brand-sm border border-gray-100 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10" rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Sin reseñas aún"
          description="Tus reseñas a técnicos aparecerán aquí una vez que completes un servicio."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="bg-white border border-gray-100 shadow-brand-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar src={review.clientAvatar} name={review.clientName} size="md" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-text-primary">{review.clientName}</p>
                          <StarRating rating={review.rating} size="sm" showValue className="mt-1" />
                        </div>
                        <span className="text-xs text-text-muted">{formatRelativeTime(review.createdAt)}</span>
                      </div>
                      <p className="text-text-secondary text-sm mt-3 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
