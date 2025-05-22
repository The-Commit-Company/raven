import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react'
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

// Sidebar mode types và context
type SidebarMode = 'default' | 'hide-filter' | 'show-only-icons'

interface SidebarModeContextValue {
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  title: string
  setTitle: (title: string) => void
}

export const SidebarModeContext = createContext<SidebarModeContextValue | undefined>(undefined)

export const SidebarModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<SidebarMode>('default')
  const [title, setTitle] = useState<string>('Trò chuyện')

  return (
    <SidebarModeContext.Provider value={{ mode, setMode, title, setTitle }}>
      <UnreadCountProvider>{children}</UnreadCountProvider>
    </SidebarModeContext.Provider>
  )
}

// Hook truy xuất thông tin sidebar mode
export const useSidebarMode = (): SidebarModeContextValue => {
  const ctx = useContext(SidebarModeContext)
  if (!ctx) throw new Error('useSidebarMode must be used within SidebarModeProvider')
  return ctx
}
