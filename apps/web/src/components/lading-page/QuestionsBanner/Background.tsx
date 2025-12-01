'use client'

import { motion, useAnimation, useInView, Variants } from 'motion/react'
import { useEffect, useRef } from 'react'

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.5
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    }
  },
}

const image: React.CSSProperties = {
  maxWidth: '80vw',
}

export const Background = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) controls.start('visible')
  }, [isInView, controls])

  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full opacity-40" ref={ref}>
      <motion.svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        initial="hidden"
        animate={controls}
        style={image}
      >
        <motion.line
          x1="50"
          y1="0"
          x2="50"
          y2="100"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={2}
          style={shape}
        />
        <motion.line
          x1="50"
          y1="100"
          x2="300"
          y2="0"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={3.5}
          style={shape}
        />

        <motion.line
          x1="0"
          y1="240"
          x2="250"
          y2="240"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={2}
          style={shape}
        />
        <motion.line
          x1="250"
          y1="240"
          x2="500"
          y2="100"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={4}
          style={shape}
        />

        <motion.line
          x1="200"
          y1="375"
          x2="125"
          y2="375"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={2}
          style={shape}
        />
        <motion.line
          x1="125"
          y1="375"
          x2="175"
          y2="400"
          stroke="var(--color-red-300)"
          variants={draw}
          custom={4}
          style={shape}
        />
      </motion.svg>
      <div className="absolute inset-0 hidden overflow-hidden lg:block">
        <motion.div
          className="absolute top-8 right-12 h-28 origin-right bg-red-900/40"
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ width: '180px' }}
        />

        <motion.div
          className="absolute right-0 bottom-12 h-36 origin-right bg-red-950/60"
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.6 }}
          style={{ width: '40%' }}
        />

        <motion.div
          className="absolute bottom-24 left-8 h-20 origin-left bg-red-800/35"
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 1 }}
          style={{ width: '120px' }}
        />

        <motion.svg
          className="absolute top-12 right-4 h-48 w-32"
          viewBox="0 0 100 150"
          initial="hidden"
          animate={controls}
        >
          <motion.line
            x1="80"
            y1="0"
            x2="20"
            y2="150"
            stroke="rgba(248, 113, 113, 0.4)"
            strokeWidth="1"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1 },
            }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 1.2 }}
          />
        </motion.svg>
      </div>
    </div>
  )
}

const shape: React.CSSProperties = {
  strokeWidth: 1,
  strokeLinecap: 'round',
  fill: 'transparent',
}
