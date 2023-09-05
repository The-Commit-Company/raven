import { useContext, useMemo } from 'react'
import { UserFields, UserListContext } from '../utils/users/UserListProvider'

export const useGetUser = (userID?: string): UserFields | undefined => {
    const { users } = useContext(UserListContext)

    const userInfo = useMemo(() => {
        if (userID) {
            return users.find((user) => user.name === userID)
        } else {
            return undefined
        }
    }, [userID, users])
    return userInfo
}