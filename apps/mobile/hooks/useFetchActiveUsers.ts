import { useFrappeEventListener, useFrappeGetCall, useSWRConfig } from 'frappe-react-sdk'
import { useActiveState } from './useActiveState'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'

/**
 * Hook to fetch active users from the server.
 * SWRKey: active_users
 */
const useFetchActiveUsers = () => {
    const res = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users',
        undefined,
        'active_users',
        {
            dedupingInterval: 1000 * 60 * 5, // 5 minutes - do not refetch if the data is fresh
        }
    )

    return res
}

/**
 * Hook to listen to user_active_state_updated event and update the active_users list in realtime
 * Also handles the user's active state via visibilty change and idle timer
 */
export const useFetchActiveUsersRealtime = () => {
    const { myProfile: currentUserInfo } = useCurrentRavenUser();

    const { mutate } = useSWRConfig()

    useActiveState()

    /** Hook to listen to user_active_state */
    useFrappeEventListener('raven:user_active_state_updated', (data) => {
        if (data.user !== currentUserInfo?.name) {
            // If the user is not the current user, update the active_users list
            // No need to revalidate the data as the websocket event has emitted the new data for that user
            mutate('active_users', (res?: { message: string[] }) => {
                if (res) {
                    if (data.active) {
                        return { message: [...res.message, data.user] }
                    } else {
                        return { message: res.message.filter(user => user !== data.user) }
                    }
                } else {
                    return undefined
                }
            }, {
                revalidate: false
            })
        }
    })
}

export default useFetchActiveUsers