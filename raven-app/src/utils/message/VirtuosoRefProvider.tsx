import { createContext, PropsWithChildren, useRef } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

interface VirtuosoRefContextProps {
    virtuosoRef: React.RefObject<VirtuosoHandle> | null
}

export const VirtuosoRefContext = createContext<VirtuosoRefContextProps>({ virtuosoRef: null })

export const VirtuosoRefProvider = ({ children }: PropsWithChildren) => {

    const virtuosoRef = useRef<VirtuosoHandle>(null)

    return (
        <VirtuosoRefContext.Provider value={{ virtuosoRef }}>
            {children}
        </VirtuosoRefContext.Provider>
    )
}