import { useFrappeAuth, useFrappeGetCall, useFrappeGetDoc } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'
import { User } from "../../types/User/User";
import { Outlet } from 'react-router-dom'
import { UserSidebar } from '../../components/layout/Sidebar/UserSidebar'

interface UserContextProps {
    isLoading: boolean,
    isValidating: boolean,
    currentUser: string,
    userData: User | undefined,
    login: (username: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    userData: undefined,
    isLoading: false,
    isValidating: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {

    const { login, logout, isValidating, currentUser, error, updateCurrentUser } = useFrappeAuth()

    const { data } = useFrappeGetCall<User>('raven.channel_management.doctype.channel.channel.get_user_data', {
        user_id: currentUser
    })

    const isLoading = (currentUser === undefined || currentUser === null) && (error === null || error === undefined);

    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login, logout, currentUser: currentUser ?? "", userData: data, isValidating }}>
            <UserSidebar>
                <Outlet />
            </UserSidebar>
        </UserContext.Provider>
    )
}