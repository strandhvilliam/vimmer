import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import SuperJSON from "superjson"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
      },
      dehydrate: {
        // serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => {
          return false
        },
      },
      // hydrate: {
      //   deserializeData: SuperJSON.deserialize,
      // },
    },
  })
