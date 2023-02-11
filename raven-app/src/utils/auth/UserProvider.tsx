import { useFrappeAuth } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'
import { Outlet } from 'react-router-dom'
import { UserSidebar } from '../../components/layout/Sidebar/UserSidebar'

interface UserContextProps {
    isLoading: boolean,
    isValidating: boolean,
    currentUser: string,
    login: (username: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    isLoading: false,
    isValidating: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
    const { login, logout, isValidating, currentUser, error, updateCurrentUser } = useFrappeAuth();
    const isLoading = (currentUser === undefined || currentUser === null) && (error === null || error === undefined);
    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login, logout, currentUser: currentUser ?? "", isValidating }}>
            <UserSidebar>
                <Outlet />
            </UserSidebar>
        </UserContext.Provider>
    )
}