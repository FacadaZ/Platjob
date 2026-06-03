import { useEffect } from "react";

/**
 * Sets the document title with the app suffix.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — PlatJob` : "PlatJob";
    return () => {
      document.title = "PlatJob";
    };
  }, [title]);
}
