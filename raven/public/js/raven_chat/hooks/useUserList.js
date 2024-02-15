import useSWR from "swr"
import { fetcher } from "./useFetch"
import useStartFetch from "./useStartFetch"

const useUserList = () => {

    /** Only fetch users when Raven is first opened */
    const startFetch = useStartFetch()

    const { data, error, isLoading } = useSWR(startFetch ? 'raven.api.raven_users.get_list' : null, fetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    })

    return {
        users: data,
        isLoading,
        error
    }
}

export default useUserList;