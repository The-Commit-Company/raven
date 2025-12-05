import { useSWR } from "frappe-react-sdk"
import { db } from "../db/db"

const getUserKey = (userID: string) => `user::${userID}`

const getUser = async (userID: string) => {
    return db.users.get(userID)
}

/**
 * Hook to get a user from the IndexedDB database
 * @param userID - The ID of the user to get
 */
export const useUser = (userID: string) => {

    return useSWR(getUserKey(userID), () => getUser(userID), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    })
}