import React, { createContext, useContext, useState } from "react"

interface ActiveWorkspaceContextType {
    activeWorkspaceName: string | null
    setActiveWorkspaceName: (name: string | null) => void
}

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType>({
    activeWorkspaceName: null,
    setActiveWorkspaceName: () => { },
})

export const useActiveWorkspace = () => useContext(ActiveWorkspaceContext)

export const ActiveWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize from localStorage if available
    const [activeWorkspaceName, setActiveWorkspaceNameState] = useState<string | null>(() => {
        try {
            const stored = localStorage.getItem('ravenLastWorkspace')
            if (stored) {
                return JSON.parse(stored)
            }
        } catch {
            // Ignore parse errors
        }
        return null
    })

    // Persist to localStorage when it changes
    const setActiveWorkspaceName = (name: string | null) => {
        setActiveWorkspaceNameState(name)
        if (name) {
            localStorage.setItem('ravenLastWorkspace', JSON.stringify(name))
        } else {
            localStorage.removeItem('ravenLastWorkspace')
        }
    }

    return (
        <ActiveWorkspaceContext.Provider value={{ activeWorkspaceName, setActiveWorkspaceName }}>
            {children}
        </ActiveWorkspaceContext.Provider>
    )
}
