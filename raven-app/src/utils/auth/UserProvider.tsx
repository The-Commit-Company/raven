import { useFrappeAuth } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'
import { FullPageLoader } from '../../components/layout/Loaders';
import { Center } from '@chakra-ui/react';
import { AlertBanner } from '../../components/layout/AlertBanner';

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

    const { login, logout, isValidating, currentUser, error, updateCurrentUser } = useFrappeAuth()

    const isLoading = (currentUser === undefined || currentUser === null) && (error === null || error === undefined);

    if (isValidating) {
        return <FullPageLoader />
    }

    if (error) {
        return (
            <Center width='100vw' height='100vh'>
                <AlertBanner status='error' heading={error.message}>{error.httpStatusText} - {error.httpStatus}</AlertBanner>
            </Center>
        )
    }

    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, login, logout, currentUser: currentUser ?? "", isValidating }}>
            {children}
        </UserContext.Provider>
    )
}