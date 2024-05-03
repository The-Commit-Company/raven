import { useContext, useMemo } from 'react';
import { UserContext } from '@/utils/auth/UserProvider';
import useFetchActiveUsers from './fetchers/useFetchActiveUsers';

export const useIsUserActive = (userID?: string): boolean => {

    const { currentUser } = useContext(UserContext)

    const { data } = useFetchActiveUsers()

    const isActive = useMemo(() => {
        if (userID === currentUser) {
            return true
        } else if (userID) {
            return data?.message.includes(userID) ?? false
        } else {
            return false
        }
    }, [userID, data])

    return isActive
}