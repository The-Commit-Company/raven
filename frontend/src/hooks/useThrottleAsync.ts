import { useCallback, useRef } from 'react'

export const useThrottleAsync = <T extends (...args: any[]) => Promise<any>>(fn: T, delay: number): T => {
  const lastCalled = useRef<number>(0)
  const pending = useRef<boolean>(false)

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCalled.current >= delay && !pending.current) {
        lastCalled.current = now
        pending.current = true

        return fn(...args).finally(() => {
          pending.current = false
        })
      }
    }) as T,
    [fn, delay]
  )
}
