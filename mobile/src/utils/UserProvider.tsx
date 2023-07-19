import { useFrappeAuth } from 'frappe-react-sdk'
import { createContext, FC, PropsWithChildren, useContext } from 'react'
import { AuthContext } from './AuthProvider'

interface UserContextProps {
    currentUser: string
}

export const UserContext = createContext<UserContextProps>({
    currentUser: ''
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
    const { currentUser } = useContext(AuthContext)
    console.log(currentUser)
    return (
        <UserContext.Provider value={{ currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}