import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface ChannelInfo {
  name: string
  channel_name: string
  type: string
  is_direct_message: number
  is_self_message: number
  last_message_timestamp: string | null
  last_message_details: string | null
  peer_user_id: string | null
  unread_count: number
  [key: string]: any
}

interface CircleUserListContextType {
  selectedChannels: ChannelInfo[]
  setSelectedChannels: React.Dispatch<React.SetStateAction<ChannelInfo[]>>
  pushChannel: (channel: ChannelInfo) => void
  removeChannel: (channel_id: string) => void
}

const LOCAL_STORAGE_KEY = 'raven_selected_channels'

const CircleUserListContext = createContext<CircleUserListContextType | undefined>(undefined)

export const CircleUserListProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChannels, setSelectedChannels] = useState<ChannelInfo[]>([])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        setSelectedChannels(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse selected channels:', e)
      }
    }
  }, [])

  // Push and persist
  const pushChannel = (channel: ChannelInfo) => {
    setSelectedChannels((prev) => {
      // Optional: tránh trùng lặp
      const isExist = prev.find((c) => c.name === channel.name)
      const updated = isExist ? prev : [...prev, channel]
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removeChannel = (channel_id: string) => {
    setSelectedChannels((prev) => {
      const updated = prev.filter((c) => c.name !== channel_id)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <CircleUserListContext.Provider value={{ selectedChannels, setSelectedChannels, pushChannel, removeChannel }}>
      {children}
    </CircleUserListContext.Provider>
  )
}

export const useCircleUserList = (): CircleUserListContextType => {
  const context = useContext(CircleUserListContext)
  if (!context) {
    throw new Error('useCircleUserList must be used within a CircleUserListProvider')
  }
  return context
}
