export default function throttle<T extends (...args: any[]) => void>(func: T, delay: number) {
  let lastCall = 0
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    const now = Date.now()

    const remaining = delay - (now - lastCall)
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      lastCall = now
      func(...args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now()
        timeout = null
        func(...args)
      }, remaining)
    }
  }
}
