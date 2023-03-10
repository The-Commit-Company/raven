import { Center } from '@chakra-ui/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useContext } from 'react'
import { AlertBanner } from '../../components/layout/AlertBanner'
import { FullPageLoader } from '../../components/layout/Loaders'
import { User } from '../../types/User/User'
import { UserContext } from '../auth/UserProvider'

export const UserDataContext = createContext<User | null>(null)

export const UserDataProvider = ({ children }: PropsWithChildren) => {

    const { currentUser } = useContext(UserContext)
    const { data, error } = useFrappeGetCall<{ message: User }>('frappe.client.get_value', {
        doctype: "User",
        filters: JSON.stringify({ name: currentUser }),
        fieldname: JSON.stringify(["name", "first_name", "full_name", "user_image", "last_active"])
    })

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
    return (
        <UserDataContext.Provider value={data?.message ?? null}>
            {children}
        </UserDataContext.Provider>
    )
}