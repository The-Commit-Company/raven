import { useFrappeAuth } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'

interface UserContextProps {
    isLoading: boolean,
    currentUser: string,
    login: (username: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    isLoading: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {

    const { login, logout, currentUser, updateCurrentUser, isLoading } = useFrappeAuth()

    const handleLogout = async () => {
        localStorage.removeItem('ravenLastChannel')
        return logout()
    }
    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login, logout: handleLogout, currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}