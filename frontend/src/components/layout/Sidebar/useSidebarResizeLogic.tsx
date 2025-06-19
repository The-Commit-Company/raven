import { useEffect, useRef, useState } from 'react'
import { useSidebarMode } from '@/utils/layout/sidebar'

export const useSidebarResizeLogic = (sidebarRef: React.RefObject<any>) => {
  const sidebarMinWidth = 3
  const sidebarCompactMaxWidth = 4.5
  const sidebarDefaultMinWidth = 10
  const sidebarDefaultExpandedWidth = 15

  const { mode, setMode, tempMode, setTempMode } = useSidebarMode()
  const latestSizeRef = useRef<number | null>(null)
  const isSidebarCompactRef = useRef(false)

  const shouldResize = (current: number, target: number) => Math.abs(current - target) > 0.1

  const handleSidebarResize = (size: number) => {
    latestSizeRef.current = size

    if (size <= sidebarCompactMaxWidth && tempMode !== 'show-only-icons') {
      setTempMode('show-only-icons')
    } else if (size > sidebarCompactMaxWidth && tempMode !== 'default') {
      setTempMode('default')
    }
  }

  const handleSidebarPointerUp = () => {
    const size = latestSizeRef.current ?? sidebarRef?.current?.getSize?.() ?? null
    if (size == null) return

    const isCompact = isSidebarCompactRef.current

    if (size >= sidebarDefaultExpandedWidth) {
      setMode('default')
      isSidebarCompactRef.current = false
      return
    }

    if (size <= sidebarCompactMaxWidth) {
      if (shouldResize(size, sidebarMinWidth)) {
        sidebarRef?.current?.resize(sidebarMinWidth)
      }
      setMode('show-only-icons')
      isSidebarCompactRef.current = true
      return
    }

    if (isCompact && size > sidebarCompactMaxWidth) {
      if (shouldResize(size, sidebarDefaultMinWidth)) {
        sidebarRef?.current?.resize(sidebarDefaultMinWidth)
      }
      setMode('default')
      isSidebarCompactRef.current = false
      return
    }

    if (!isCompact && size > sidebarCompactMaxWidth && size < sidebarDefaultMinWidth) {
      if (shouldResize(size, sidebarDefaultMinWidth)) {
        sidebarRef?.current?.resize(sidebarDefaultMinWidth)
      }
      setMode('default')
      isSidebarCompactRef.current = false
    }
  }

  useEffect(() => {
    if (!sidebarRef?.current) return

    if (mode === 'show-only-icons') {
      sidebarRef?.current?.resize(sidebarMinWidth)
    } else if (mode === 'default') {
      sidebarRef?.current?.resize(sidebarDefaultExpandedWidth)
    } else if (mode === 'hide-filter') {
      sidebarRef?.current?.resize(sidebarMinWidth) // hoặc một giá trị nhỏ tuỳ thiết kế ẩn hoàn toàn
    }
  }, [mode])

  return {
    handleSidebarResize,
    handleSidebarPointerUp
  }
}
