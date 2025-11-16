/* eslint-disable no-console */

export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
