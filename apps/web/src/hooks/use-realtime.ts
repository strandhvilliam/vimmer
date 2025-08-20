"use client";

import { Database } from "@vimmer/supabase/types";
import {
  RealtimePostgresChangesFilter,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { createClient } from "@vimmer/supabase/browser";
import { useEffect } from "react";

type PublicSchema = Database[Extract<keyof Database, "public">];
type Tables = PublicSchema["Tables"];
type TableName = keyof Tables;

interface UseRealtimeOptions<TN extends TableName> {
  channelName: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  table: TN;
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<Tables[TN]["Row"]>) => void;
}

export function useRealtime<TN extends TableName>({
  channelName,
  event,
  table,
  filter,
  onEvent,
}: UseRealtimeOptions<TN>) {
  const supabase = createClient();
  useEffect(() => {
    const filterConfig: RealtimePostgresChangesFilter<"*"> = {
      event: event as RealtimePostgresChangesFilter<"*">["event"],
      schema: "public",
      table,
      filter,
    };

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        filterConfig,
        (payload: RealtimePostgresChangesPayload<Tables[TN]["Row"]>) =>
          onEvent(payload),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);
}
