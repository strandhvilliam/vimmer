"use client";

import { Session, User } from "better-auth";
import { createContext, useContext, ReactNode, use } from "react";

type SessionContextType = {
  session: Session | null;
  user: User | null;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({
  children,
  sessionPromise,
}: {
  children: ReactNode;
  sessionPromise: Promise<{ session: Session; user: User } | null>;
}) {
  const data = use(sessionPromise);
  const value = data ?? { session: null, user: null };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
