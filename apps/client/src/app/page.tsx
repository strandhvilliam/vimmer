// 'use client'
// import { motion } from 'motion/react'
// import Link from 'next/link'
//
// export default function Page1() {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 5 }}
//       layoutId="mypage"
//     >
//       <Link className="text-3xl" href="/page2">
//         Page1
//       </Link>
//     </motion.div>
//   )
// }

import RealtimeDemo from '@/components/realtime-demo'
import UploadZone from '@/components/upload-zone'

export default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <RealtimeDemo />
        <UploadZone />
        {/* <Button onClick={() => execute({ ref: '1232', competitionId: 1 })} variant="outline"> */}
        {/*   {isExecuting ? 'Loading...' : 'Initialize Submission'} */}
        {/* </Button> */}
        {/* <pre>{JSON.stringify(result.data, null, 2)}</pre> */}
        {/* {hasErrored && <pre>{JSON.stringify(result.serverError, null, 2)}</pre>} */}
      </main>
    </div>
  )
}
