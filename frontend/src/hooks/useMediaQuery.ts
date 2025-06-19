import { useEffect, useState } from 'react'

const useMediaQuery = (query: string) => {
  const [value, setValue] = useState(matchMedia(query).matches)

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

export default useMediaQuery

export const useIsDesktop = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return isDesktop
}

export const useIsMobile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile
}

export const useIsTablet = () => {
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return isTablet
}
