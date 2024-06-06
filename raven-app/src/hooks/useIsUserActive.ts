import { useContext, useMemo } from 'react';
import { UserContext } from '@/utils/auth/UserProvider';
import useFetchActiveUsers from './fetchers/useFetchActiveUsers';
import { useGetUser } from './useGetUser';

export const useIsUserActive = (userID?: string): boolean => {

    const { currentUser } = useContext(UserContext)
    const { data } = useFetchActiveUsers()
    const user = useGetUser(userID)

    const isActive = useMemo(() => {
        // if user has explicitly set their status to invisible, do not show them as active
        if (user?.availability_status === 'Invisible') {
            return false
        } else if (userID === currentUser) {
            return true
        } else if (userID) {
            return data?.message.includes(userID) ?? false
        } else {
            return false
        }
    }, [userID, data])

    return isActive
}