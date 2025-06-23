import { useEffect, useState } from 'react'

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isOnline
}

export const useNetworkStatus = (isLoading: boolean) => {
  const isOnline = useOnlineStatus()
  const [isNetworkSlow, setIsNetworkSlow] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isOnline && isLoading) {
      timer = setTimeout(() => {
        setIsNetworkSlow(true)
      }, 3000) // Nếu loading > 3 giây → mạng chậm
    } else {
      setIsNetworkSlow(false)
      if (timer) clearTimeout(timer)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOnline, isLoading])

  return { isOnline, isNetworkSlow }
}
