import { useContext } from 'react'
import { UserListContext } from '../providers/UserListProvider'
import { UserFields } from '@raven/types/common/UserFields'

/**
 * This hook is used to get the user object from the user list.
 * @param userID - The ID of the user to get.
 * @returns The user object if found, otherwise undefined.
 */
export const useGetUser = (userID?: string): UserFields | undefined => {
    const { users } = useContext(UserListContext)

    if (!userID) {
        return undefined
    }

    return users.get(userID)
}