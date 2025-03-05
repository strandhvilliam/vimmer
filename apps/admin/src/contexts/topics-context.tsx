"use client";

import { Topic } from "@vimmer/supabase/types";
import { createContext, useContext, useState, ReactNode } from "react";

interface TopicsState {
  topics: Topic[];
  hasChanges: boolean;
  isLoading: boolean;
  error?: string;
}

interface TopicsContextType {
  state: TopicsState;
  updateTopics: (topics: Topic[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | undefined) => void;
  resetChanges: () => void;
}

const TopicsContext = createContext<TopicsContextType | undefined>(undefined);

interface TopicsProviderProps {
  initialTopics: Topic[];
  children: ReactNode;
}

export function TopicsProvider({
  initialTopics,
  children,
}: TopicsProviderProps) {
  const [state, setState] = useState<TopicsState>({
    topics: initialTopics,
    hasChanges: false,
    isLoading: false,
  });

  const updateTopics = (newTopics: Topic[]) => {
    setState((prev) => ({
      ...prev,
      topics: newTopics,
      hasChanges: true,
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | undefined) => {
    setState((prev) => ({ ...prev, error }));
  };

  const resetChanges = () => {
    setState((prev) => ({ ...prev, hasChanges: false }));
  };

  return (
    <TopicsContext.Provider
      value={{
        state,
        updateTopics,
        setLoading,
        setError,
        resetChanges,
      }}
    >
      {children}
    </TopicsContext.Provider>
  );
}

export function useTopics() {
  const context = useContext(TopicsContext);
  if (context === undefined) {
    throw new Error("useTopics must be used within a TopicsProvider");
  }
  return context;
}
