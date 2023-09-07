import { useFrappeAuth } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'

interface UserContextProps {
    isLoading: boolean,
    isLoggedIn: boolean,
    currentUser: string,
    login: (username: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    isLoading: false,
    isLoggedIn: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {

    const { login, logout, currentUser, error, updateCurrentUser, isLoading } = useFrappeAuth()

    const isLoggedIn = currentUser !== undefined && currentUser !== null && currentUser !== "Guest"

    return (
        <UserContext.Provider value={{ isLoading, isLoggedIn, updateCurrentUser, login, logout, currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}