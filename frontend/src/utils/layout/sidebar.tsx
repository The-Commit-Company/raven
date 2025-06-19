import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react'
import { useFetchUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import { DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'

export interface UnreadItem {
  name: string
  unread_count: number
  last_message_timestamp?: string
  is_direct_message?: number
  last_message_content?: string
  last_message_sender_name?: string
}

interface UnreadContextValue {
  message: UnreadItem[]
}

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
  if (!context) return { message: [] }
  return context
}

export const useUnreadContext = (): UnreadContextValue => {
  const context = useContext(UnreadCountContext)
  if (!context) {
    throw new Error('useUnreadContext must be used within UnreadCountProvider')
  }
  return context
}

export type SidebarMode = 'default' | 'hide-filter' | 'show-only-icons'
type TitleType = string | { labelId: string; labelName: string }

interface SidebarModeContextValue {
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  tempMode: SidebarMode
  setTempMode: (mode: SidebarMode) => void
  title: TitleType
  setTitle: (title: TitleType) => void
  labelID: string
  setLabelID: (labelID: string) => void
}

const SidebarModeContext = createContext<SidebarModeContextValue | undefined>(undefined)

export const SidebarModeProvider = ({ children }: { children: ReactNode }) => {
  const LOCAL_STORAGE_SIDEBAR_MODE = 'sidebar-mode'
  const LOCAL_STORAGE_SIDEBAR_TITLE = 'sidebar-title'

  const [mode, setModeRaw] = useState<SidebarMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_MODE) as SidebarMode
      return saved || 'default'
    }
    return 'default'
  })

  const [title, setTitleRaw] = useState<TitleType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_TITLE)
      try {
        return saved ? JSON.parse(saved) : 'Trò chuyện'
      } catch {
        return 'Trò chuyện'
      }
    }
    return 'Trò chuyện'
  })

  const [tempMode, setTempMode] = useState<SidebarMode>('default')
  const [labelID, setLabelID] = useState('')

  useEffect(() => {
    setTempMode(mode)
  }, [mode])

  const setMode = (newMode: SidebarMode) => {
    localStorage.setItem(LOCAL_STORAGE_SIDEBAR_MODE, newMode)
    setModeRaw(newMode)
  }

  const setTitle = (newTitle: TitleType) => {
    localStorage.setItem(LOCAL_STORAGE_SIDEBAR_TITLE, JSON.stringify(newTitle))
    setTitleRaw(newTitle)
  }

  const contextValue = useMemo<SidebarModeContextValue>(
    () => ({ mode, setMode, tempMode, setTempMode, title, setTitle, labelID, setLabelID }),
    [mode, tempMode, title, labelID]
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

interface LocalChannelListContextValue {
  localChannels: DMChannelWithUnreadCount[]
  setChannels: React.Dispatch<React.SetStateAction<DMChannelWithUnreadCount[]>>
}

const LocalChannelListContext = createContext<LocalChannelListContextValue | undefined>(undefined)

export const LocalChannelListProvider = ({
  children,
  initialChannels
}: {
  children: ReactNode
  initialChannels: DMChannelWithUnreadCount[]
}) => {
  const [localChannels, setChannels] = useState(initialChannels)

  const value = useMemo(() => ({ localChannels, setChannels }), [localChannels])

  return <LocalChannelListContext.Provider value={value}>{children}</LocalChannelListContext.Provider>
}

export const useLocalChannelList = (): LocalChannelListContextValue => {
  const context = useContext(LocalChannelListContext)
  if (!context) {
    throw new Error('useLocalChannelList must be used within LocalChannelListProvider')
  }
  return context
}

export const useUnreadCount = () => {
  const ctx = useContext(UnreadCountContext)
  if (!ctx) throw new Error('useUnreadCount must be used within an UnreadCountProvider')
  return ctx
}
