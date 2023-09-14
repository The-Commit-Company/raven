import { useContext, useMemo } from 'react';
import { ActiveUsersContext } from '../utils/users/ActiveUsersProvider';

export const useIsUserActive = (userID?: string): boolean => {

    const activeUsers = useContext(ActiveUsersContext)
    const isActive = useMemo(() => {
        if (userID) {
            return activeUsers.includes(userID)
        } else {
            return false
        }
    }, [userID, activeUsers])

    return isActive
}