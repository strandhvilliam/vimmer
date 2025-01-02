'use client'
import { motion } from 'motion/react'
import Link from 'next/link'

export default function Page2() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 5 }}
      layoutId="mypage"
    >
      <Link className="text-3xl" href="/">
        Page2
      </Link>
    </motion.div>
  )
}
