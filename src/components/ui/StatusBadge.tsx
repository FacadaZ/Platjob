import clsx from "clsx";
import { Chip } from "@/components/ui/HeroUICompat";
import type { RequestStatus } from "@/types";
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from "@/constants";
import { Clock, CheckCircle, RefreshCw, CheckCheck, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Chip
      size="sm"
      color={REQUEST_STATUS_COLORS[status] as never}
      variant="flat"
      className={clsx("font-medium", className)}
    >
      {REQUEST_STATUS_LABELS[status]}
    </Chip>
  );
}
