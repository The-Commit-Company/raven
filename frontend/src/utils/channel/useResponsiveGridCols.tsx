import { useEffect, useState } from 'react'

export const useResponsiveGridCols = (
  itemMinWidth: number,
  itemMaxWidth: number,
  itemCount: number
): number => {
  const calculateCols = () => {
    const screenWidth = window.innerWidth

    let responsiveMaxCols: number
    if (screenWidth < 640) {
      responsiveMaxCols = 2
    } else if (screenWidth < 768) {
      responsiveMaxCols = 3
    } else if (screenWidth < 1024) {
      responsiveMaxCols = 4
    } else if (screenWidth < 1280) {
      responsiveMaxCols = 5
    } else if (screenWidth < 1536) {
      responsiveMaxCols = 6
    } else {
      responsiveMaxCols = 7
    }

    const idealCols = Math.ceil(Math.sqrt(itemCount))
    return Math.max(
      Math.ceil(screenWidth / itemMaxWidth / 1.5),
      Math.min(idealCols, responsiveMaxCols)
    )
  }

  const [gridCols, setGridCols] = useState(calculateCols)

  useEffect(() => {
    const onResize = () => setGridCols(calculateCols())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [itemCount, itemMaxWidth])

  return gridCols
}
