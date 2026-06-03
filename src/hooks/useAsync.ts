import { useState, useCallback } from "react";
import { useUIStore } from "@/store";

/**
 * Wraps any async operation with loading/error state management
 * and optional toast feedback.
 */
export function useAsync<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options?: { successMessage?: string; errorMessage?: string }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useUIStore();

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        if (options?.successMessage) {
          addToast({ type: "success", title: options.successMessage });
        }
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : (options?.errorMessage ?? "Ocurrió un error");
        setError(message);
        addToast({ type: "error", title: message });
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn]
  );

  return { execute, isLoading, error };
}
