import useUserList from "./useUserList"

const useGetUser = (user_id = frappe.session.user) => {

    const { users = [] } = useUserList()

    const user = users?.message?.find(user => user.name === user_id)

    return user
}

export default useGetUser;