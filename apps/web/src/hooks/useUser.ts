import { useSWR } from "frappe-react-sdk"
import { db } from "@db"

const getUserKey = (userID: string) => `user::${userID}`

const getUser = async (userID: string) => {
    return db.users.get(userID)
}

/**
 * Hook to get a user from the IndexedDB database
 * @param userID - The ID of the user to get
 * 
 * If an ID is not provided, the hook will return undefined.
 */
export const useUser = (userID?: string) => {

    return useSWR(userID ? getUserKey(userID) : null, () => userID ? getUser(userID) : undefined, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    })
}