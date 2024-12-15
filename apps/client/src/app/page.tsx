'use client'
import { Button } from '@vimmer/ui/components/button'
import { useEffect } from 'react'
import { getParticipantByIdQuery } from '@vimmer/supabase/queries'
import { createClient } from '@vimmer/supabase/client'

export default function Home() {
  const client = createClient()
  useEffect(() => {
    getParticipantByIdQuery(client, 1).then(data => {
      console.log(data)
    })
  }, [client])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Button variant="outline">Primary Button</Button>
      </main>
    </div>
  )
}
