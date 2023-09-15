import { useContext, useMemo } from 'react';
import { ActiveUsersContext } from '../utils/users/ActiveUsersProvider';
import { UserContext } from '@/utils/auth/UserProvider';

export const useIsUserActive = (userID?: string): boolean => {

    const { currentUser } = useContext(UserContext)
    const activeUsers = useContext(ActiveUsersContext)
    const isActive = useMemo(() => {
        if (userID === currentUser) {
            //Current user will always be active
            return true
        } else if (userID) {
            return activeUsers.includes(userID)
        } else {
            return false
        }
    }, [userID, activeUsers])

    return isActive
}