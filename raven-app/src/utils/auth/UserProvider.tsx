import { useFrappeAuth, useSWRConfig } from 'frappe-react-sdk'
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

    const { mutate } = useSWRConfig()
    const { login, logout, currentUser, updateCurrentUser, isLoading } = useFrappeAuth()

    const handleLogout = async () => {
        localStorage.removeItem('ravenLastChannel')
        return logout()
            .then(() => {
                //Clear cache on logout
                return mutate(() => true, undefined, false)
            })
            .then(() => {
                //Reload the page so that the boot info is fetched again
                const URL = import.meta.env.VITE_BASE_NAME ? `${import.meta.env.VITE_BASE_NAME}` : ``
                window.location.replace(`/login?redirect-to=${URL}/channel`)
                // window.location.reload()
            })
    }

    const handleLogin = async (username: string, password: string) => {
        return login({
            username,
            password
        })
            .then(() => {
                //Reload the page so that the boot info is fetched again
                const URL = import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ``
                window.location.replace(`${URL}/channel`)
            })
    }
    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login: handleLogin, logout: handleLogout, currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}