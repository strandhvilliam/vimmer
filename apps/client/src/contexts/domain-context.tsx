import { createContext, useContext, type ReactNode } from "react";

type DomainContextType = {
  domain: string;
};

const DomainContext = createContext<DomainContextType | null>(null);

export function useDomain(): DomainContextType {
  const context = useContext(DomainContext);
  if (context === null) {
    throw new Error("useDomain must be used within a DomainProvider");
  }
  return context;
}

export function DomainProvider({
  children,
  domain,
}: {
  children: ReactNode;
  domain: string;
}) {
  if (domain === "localhost") {
    domain = "demo";
  }

  return (
    <DomainContext.Provider value={{ domain }}>
      {children}
    </DomainContext.Provider>
  );
}
