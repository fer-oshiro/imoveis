"use client"

import { motion, Variants } from "motion/react"

const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
        const delay = i * 0.5
        return {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
                opacity: { delay, duration: 0.01 },
            },
        }
    },
}

const image: React.CSSProperties = {
    maxWidth: "80vw",
}


export const Background = () => {
    return (
        <div className="absolute top-0 left-0 h-full w-full z-10 opacity-40">
            <motion.svg
                width="600"
                height="600"
                viewBox="0 0 600 600"
                initial="hidden"
                animate="visible"
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
                    y1="300"
                    x2="150"
                    y2="300"
                    stroke="var(--color-red-300)"
                    variants={draw}
                    custom={2}
                    style={shape}
                />
                <motion.line
                    x1="150"
                    y1="300"
                    x2="175"
                    y2="400"
                    stroke="var(--color-red-300)"
                    variants={draw}
                    custom={4}
                    style={shape}
                />
            </motion.svg>
        </div>
    )
}

const shape: React.CSSProperties = {
    strokeWidth: 1,
    strokeLinecap: "round",
    fill: "transparent",
}