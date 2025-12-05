import { useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk"
import { UserData, db } from "../db/db"
import { useEffect, useState } from "react"
import { useSWRConfig } from "frappe-react-sdk"

/**
 * Hook to load all users from the server and store them in the database
 * 
 * Returns true if the users are loaded and ready to use
 */
export const useLoadUsers = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const [isReady, setIsReady] = useState(false)
    const { mutate } = useFrappeGetCall<{ message: UserData[] }>('raven.api.raven_users.get_list', undefined, undefined, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        onSuccess: async (data) => {
            await db.users.bulkPut(data.message)
            setIsReady(true)

            // Mutate all SWR keys that depend on users
            globalMutate((key) => {
                if (key && typeof key === 'string' && key.startsWith('user::')) {
                    return true
                }
                return false
            })

        }
    })

    // Check IndexedDB on mount - if data exists, app is ready immediately
    useEffect(() => {
        const checkIndexedDB = async () => {
            try {
                const count = await db.users.count()
                if (count > 0) {
                    setIsReady(true)
                }
            } catch (error) {
                console.error('Failed to check IndexedDB:', error)
            }
        }

        checkIndexedDB()
    }, [])

    // TODO: Setup realtime event listener for user changes

    useFrappeDocTypeEventListener('Raven User', () => {

        mutate().then(async (data?: { message: UserData[] }) => {
            await db.users.bulkPut(data?.message ?? [])
            globalMutate((key) => {
                if (key && typeof key === 'string' && key.startsWith('user::')) {
                    return true
                }
                return false
            })
        })
    })

    return isReady
}