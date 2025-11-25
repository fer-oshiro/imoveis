'use client'

import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

export const Number = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.3, once: true })

  const count = useMotionValue(0)
  const rounded = useTransform(() => Math.round(count.get()))

  useEffect(() => {
    if (isInView) animate(count, value, { duration: 5, delay })
  }, [count, value, isInView, delay])

  return (
    <div ref={ref} className="mx-auto flex w-fit items-center text-3xl font-bold text-red-700">
      +<motion.pre>{rounded}</motion.pre>
    </div>
  )
}
