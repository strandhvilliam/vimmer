import { Metadata } from "next"
import { Effect } from "effect"
import { Layout } from "@/lib/runtime"

export const metadata: Metadata = {
  title: "Blikka App",
}

const _DomainLayout = Effect.fn("@blikka/web/DomainLayout")(function* ({
  children,
}: LayoutProps<"/marathon/[domain]">) {
  //TODO: verify if user has access to the domain

  return <>{children}</>
})

export default Layout(_DomainLayout)
