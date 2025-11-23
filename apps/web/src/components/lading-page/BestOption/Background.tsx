'use client'

import { AnimatePresence, motion, useAnimation, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

export const Background = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) controls.start('visible')
  }, [isInView, controls])

  return (
    <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden bg-red-700" ref={ref}>
      <AnimatePresence>
        <motion.div
          className="absolute top-12 left-0 h-22 w-44 bg-red-800 opacity-30"
          variants={{
            hidden: { left: '100%' },
            visible: { left: '75%' },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          key="first"
        />
        <motion.div
          className="absolute top-52 left-0 h-44 w-4xl bg-red-800 opacity-30"
          variants={{
            hidden: { left: '100%' },
            visible: { left: '50%' },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 3.5, ease: 'easeOut', delay: 1 }}
          key="second"
        />
      </AnimatePresence>
    </div>
  )
}
