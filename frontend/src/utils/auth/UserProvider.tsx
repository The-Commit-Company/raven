import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useFrappeAuth, useSWRConfig } from 'frappe-react-sdk'
import { FC, PropsWithChildren } from 'react'
import { createContext } from 'react'
import { toast } from 'sonner'

interface UserContextProps {
    isLoading: boolean,
    currentUser: string,
    logout: () => Promise<void>,
    updateCurrentUser: VoidFunction,
}

export const UserContext = createContext<UserContextProps>({
    currentUser: '',
    isLoading: false,
    logout: () => Promise.resolve(),
    updateCurrentUser: () => { },
})

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {

    const { mutate } = useSWRConfig()
    const { logout, currentUser, updateCurrentUser, isLoading } = useFrappeAuth()

    const handleLogout = async () => {
        localStorage.removeItem('ravenLastChannel')
        localStorage.removeItem('ravenLastWorkspace')
        localStorage.removeItem('app-cache')

        // Disable push notifications
        try {
            // @ts-expect-error
            await window.frappePushNotification.disableNotification()
        } catch (error) {
            console.error('Failed to disable push notifications', error)
        }
        return logout()
            .then(() => {
                //Clear cache on logout
                return mutate((key) => {
                    if (key === 'raven.api.login.get_context') {
                        return false
                    }
                    return true
                }, undefined, false)
            })
            .then(() => {
                //Reload the page so that the boot info is fetched again
                const URL = import.meta.env.VITE_BASE_NAME ? `${import.meta.env.VITE_BASE_NAME}` : ``
                if (URL) {
                    window.location.replace(`/${URL}/login`)
                } else {
                    window.location.replace('/login')
                }

                // window.location.reload()
            })
            .catch((error) => {
                toast.error('Failed to logout', {
                    description: getErrorMessage(error)
                })
            })
    }

    return (
        <UserContext.Provider value={{ isLoading, updateCurrentUser, logout: handleLogout, currentUser: currentUser ?? "" }}>
            {children}
        </UserContext.Provider>
    )
}