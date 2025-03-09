"use client";

import { Session } from "better-auth";
import { User } from "better-auth";
import { createContext, useContext, ReactNode } from "react";

type SessionContextType = {
  sessionPromise: Promise<{ session: Session; user: User } | null>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession(): SessionContextType {
  let context = useContext(SessionContext);
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
  return (
    <SessionContext.Provider value={{ sessionPromise }}>
      {children}
    </SessionContext.Provider>
  );
}
