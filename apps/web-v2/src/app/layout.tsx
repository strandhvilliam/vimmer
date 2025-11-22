import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  console.log("root layout")
  return children
}
