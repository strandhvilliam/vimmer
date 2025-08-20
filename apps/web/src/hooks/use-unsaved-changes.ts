import { useEffect } from "react";

interface UseUnsavedChangesOptions {
  message?: string;
}

export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  options: UseUnsavedChangesOptions = {},
) {
  const {
    message = "You have unsaved changes. Are you sure you want to leave?",
  } = options;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return "";
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirmNavigation = confirm(message);
        if (!confirmNavigation) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, message]);
}
