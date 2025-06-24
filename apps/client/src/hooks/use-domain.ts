"use client";

import { useEffect, useState } from "react";

const DEV_DOMAIN = "demo";

export function useDomain(): string | null {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setDomain(DEV_DOMAIN);
      return;
    }

    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    if (parts.length >= 3 && parts[0]) {
      setDomain(parts[0]);
    } else {
      setDomain(null);
    }
  }, []);

  return domain;
}
