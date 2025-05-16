import { createContext, useContext, useState } from 'react'

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
      {children}
    </SidebarModeContext.Provider>
  )
}

export const useSidebarMode = () => {
  const ctx = useContext(SidebarModeContext)
  if (!ctx) throw new Error('useSidebarMode must be used within SidebarModeProvider')
  return ctx
}
