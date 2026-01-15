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
    const [activeWorkspaceName, setActiveWorkspaceName] = useState<string | null>(null)

    return (
        <ActiveWorkspaceContext.Provider value={{ activeWorkspaceName, setActiveWorkspaceName }}>
            {children}
        </ActiveWorkspaceContext.Provider>
    )
}
