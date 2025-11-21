'use client'

import { CSSProperties, useMemo } from 'react'

const text = '• Hiro Imóveis • Hiro Imóveis • Hiro Imóveis '

export const Divider = () => {
  const chars = useMemo(() => text.split(''), [])

  const ringStyle = useMemo(
    () =>
      ({
        '--char-count': chars.length,
        '--radius': '-60px',
        '--font-size': 0.6,
      }) as CSSProperties,
    [chars.length],
  )

  return (
    <>
      <div className="divider-root pointer-events-none absolute top-0 left-1/2 max-w-fit translate-x-[-50%_-50%] rounded-full border bg-white">
        <style jsx global>{`
          .divider-root *,
          .divider-root *:after,
          .divider-root *:before {
            box-sizing: border-box;
          }

          .divider-root {
            overflow: hidden;
            display: grid;
            place-items: center;
            accent-color: var(--red-6);
          }

          .divider-root pre {
            padding: var(--size-2);
            overflow: auto;
          }

          .divider-root ul:not(.closed) > .code-block {
            height: auto !important;
            line-height: 1 !important;
          }

          .divider-root .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }

          .divider-root *:focus-visible {
            outline-color: var(--red-6);
          }

          .divider-root input::selection {
            background: var(--red-6);
            color: var(--text-1);
            background: hsl(0 100% 50%);
            color: hsl(0 0% 100%);
          }

          .divider-root section:first-of-type {
            min-height: 150px;
            aspect-ratio: 1;
            display: grid;
            place-items: center;
          }

          .divider-root section:last-of-type {
            display: grid;
            gap: 2rem;
          }

          .divider-root form {
            display: inline-grid;
            grid-template-columns: auto auto;
            gap: 0.5rem 1rem;
            justify-content: center;
          }

          .divider-root :where(p, ul, ol, dl, h6) {
            font-size: var(--font-size-0);
          }

          .divider-root .ring {
            --inner-angle: calc((360 / var(--char-count)) * 1deg);
            --character-width: 1;
            font-family: monospace;
            text-transform: uppercase;
            font-size: calc(var(--font-size, 1) * 1rem);
            position: relative;
          }

          @media (prefers-reduced-motion: no-preference) {
            .divider-root .ring {
              animation: spin 24s infinite linear;
            }
            @keyframes spin {
              to {
                rotate: -360deg;
              }
            }
          }

          .divider-root .char {
            display: inline-block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(calc(var(--inner-angle) * var(--char-index)))
              translateY(var(--radius));
          }
        `}</style>

        <section>
          <h1 className="ring" style={ringStyle}>
            {chars.map((char, index) => (
              <span
                key={index}
                className="char"
                style={{ '--char-index': index } as CSSProperties}
                aria-hidden
              >
                {char}
              </span>
            ))}
          </h1>
        </section>
      </div>
      <div className="absolute top-0 left-1/2 aspect-square h-24 translate-x-[-50%] translate-y-[-50%] rounded-full border bg-white"></div>
    </>
  )
}
