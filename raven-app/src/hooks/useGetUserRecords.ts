import { useContext } from "react"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"

export const useGetUserRecords = () => {

    const { users } = useContext(UserListContext)
    const allUsers: Record<string, UserFields> = {}

    users.forEach((user) => {
        allUsers[user.name] = {
            name: user.name,
            full_name: user.full_name,
            user_image: user.user_image ?? '',
            first_name: user.first_name,
        }
    })

    return allUsers
}