import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'
import { User } from "../../types/User/User";
import { Outlet } from 'react-router-dom'
import { UserSidebar } from '../../components/layout/Sidebar/UserSidebar'
import { FullPageLoader } from '../../components/layout/Loaders';
import { Center } from '@chakra-ui/react';
import { AlertBanner } from '../../components/layout/AlertBanner';

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

export const UserProvider: FC<PropsWithChildren> = () => {

    const { login, logout, isValidating, currentUser, error, updateCurrentUser } = useFrappeAuth()

    const { data, error: errorFetchingUserData } = useFrappeGetCall<User>('raven.channel_management.doctype.channel.channel.get_user_data', {
        user_id: currentUser
    })

    const isLoading = (currentUser === undefined || currentUser === null) && (error === null || error === undefined);

    if (!data && !error) {
        return <FullPageLoader />
    }

    if (error) {
        return (
            <Center width='100vw' height='100vh'>
                <AlertBanner status='error' heading={error.message}>{error.httpStatusText} - {error.httpStatus}</AlertBanner>
            </Center>
        )
    }

    if (errorFetchingUserData) {
        return (
            <Center width='100vw' height='100vh'>
                <AlertBanner status='error' heading={errorFetchingUserData.message}>{errorFetchingUserData.httpStatusText} - {errorFetchingUserData.httpStatus}</AlertBanner>
            </Center>
        )
    }

    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login, logout, currentUser: currentUser ?? "", userData: data, isValidating }}>
            <UserSidebar>
                <Outlet />
            </UserSidebar>
        </UserContext.Provider>
    )
}