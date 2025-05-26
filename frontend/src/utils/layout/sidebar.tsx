import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react'
import { useFetchUnreadMessageCount } from '@/hooks/useUnreadMessageCount'

export interface UnreadItem {
  name: string
  unread_count: number
  last_message_timestamp?: string
  is_direct_message?: number
  last_message_content?: string
}

interface UnreadContextValue {
  message: UnreadItem[]
}

// Tạo context với kiểu dữ liệu chính xác
const UnreadCountContext = createContext<UnreadContextValue | undefined>(undefined)

export const UnreadCountProvider = ({ children }: { children: ReactNode }) => {
  const unreadData = useFetchUnreadMessageCount()

  const value = useMemo<UnreadContextValue>(() => {
    return unreadData ?? { message: [] }
  }, [unreadData])
  return <UnreadCountContext.Provider value={value}>{children}</UnreadCountContext.Provider>
}

export const useUnreadMessages = (): UnreadContextValue => {
  const context = useContext(UnreadCountContext)
  if (!context) return { message: [] } // fallback an toàn
  return context
}

// Hook trả về toàn bộ context (đối tượng có field message)
export const useUnreadContext = (): UnreadContextValue => {
  const context = useContext(UnreadCountContext)
  if (!context) {
    throw new Error('useUnreadContext must be used within UnreadCountProvider')
  }
  return context
}

export type SidebarMode = 'default' | 'hide-filter' | 'show-only-icons'

interface SidebarModeContextValue {
  // trạng thái chính thức
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void

  // trạng thái UI tạm thời (trong khi kéo)
  tempMode: SidebarMode
  setTempMode: (mode: SidebarMode) => void

  // tiêu đề bộ lọc được chọn
  title: string
  setTitle: (title: string) => void
}

const SidebarModeContext = createContext<SidebarModeContextValue | undefined>(undefined)

export const SidebarModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<SidebarMode>('default')
  const [tempMode, setTempMode] = useState<SidebarMode>('default')
  const [title, setTitle] = useState('Trò chuyện')

  // Đồng bộ tempMode mỗi khi mode chính thức thay đổi
  useEffect(() => {
    setTempMode(mode)
  }, [mode])

  const contextValue = useMemo(
    () => ({ mode, setMode, tempMode, setTempMode, title, setTitle }),
    [mode, tempMode, title]
  )

  return (
    <SidebarModeContext.Provider value={contextValue}>
      <UnreadCountProvider>{children}</UnreadCountProvider>
    </SidebarModeContext.Provider>
  )
}

export const useSidebarMode = (): SidebarModeContextValue => {
  const context = useContext(SidebarModeContext)
  if (!context) {
    throw new Error('useSidebarMode must be used within SidebarModeProvider')
  }
  return context
}