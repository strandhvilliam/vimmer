'use client'

import { createClient } from '@vimmer/supabase/browser'
import { SupabaseRealtimeChannel } from '@vimmer/supabase/types'
import { useEffect, useRef, useState } from 'react'

export default function RealtimeDemo() {
  const channel = useRef<SupabaseRealtimeChannel | null>(null)
  const [data, setData] = useState('none')

  useEffect(() => {
    if (!channel.current) {
      const supabase = createClient()
      channel.current = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'submissions',
            filter: 'participant_id=eq.2',
          },
          payload => {
            console.log('payload', payload)
            setData(JSON.stringify(payload, null, 2))
          },
        )
        .subscribe()
    }
    return () => {
      channel.current?.unsubscribe()
    }
  }, [])

  return (
    <div>
      <h1>RealtimeDemo</h1>
      <pre>{data}</pre>
    </div>
  )
}
