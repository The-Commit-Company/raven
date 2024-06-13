import { useContext, useMemo } from "react"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"

export const useGetUserRecords = () => {

    const { users } = useContext(UserListContext)

    const allUsers: Record<string, UserFields> = useMemo(() => {
        const usersMap: Record<string, UserFields> = {}
        users.forEach((user) => {
            usersMap[user.name] = {
                name: user.name,
                full_name: user.full_name,
                user_image: user.user_image ?? '',
                first_name: user.first_name,
                enabled: user.enabled,
                type: user.type
            }
        })
        return usersMap
    }, [users])



    return allUsers
}