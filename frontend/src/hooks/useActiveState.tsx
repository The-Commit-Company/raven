import { useContext, useEffect } from 'react'
import { useIdleTimer, PresenceType } from 'react-idle-timer'
import { FrappeContext, FrappeConfig } from 'frappe-react-sdk'
import { useBoolean } from './useBoolean'
import { toast } from 'sonner'

/**
 * We need to track and sync user's active state with the server
 * The user is active when they are on the app (making API calls or focused on the app)
 * The user is inactive when they are not on the app (not making API calls or not focused on the app)
 * If the user does not interact with the app for 15 minutes, they are considered inactive
 */
export const useActiveState = () => {
    const { call } = useContext(FrappeContext) as FrappeConfig

    const [isActive, {
        on: activate,
        off: deactivate,
    }] = useBoolean(true)

    /**
     * Make an API call to the server to refresh the user's active state
     * If an error occurs while updating the "active" state, show a toast to the user
     * @param deactivate If the user is not active, set to true so that the server can update the user's active state
     * @returns Promise that resolves when the API call is complete
     */
    const updateUserActiveState = async (deactivate = false) => {
        return call.get('raven.api.user_availability.refresh_user_active_state', {
            deactivate
        })
            .catch(() => {
                if (!deactivate) {
                    showToast()
                }
            })
    }

    /**
     * Show a toast to the user if there was an error while refreshing their active state
     */
    const showToast = () => {
        // Check if the toast is already active
        // If it is, don't show it again
        toast.error("There was an error while refreshing your active state. You may appear offline to other users.")
    }

    /**
     * Function is called whenever the user's active state changes
     * @param presence
     */
    const onPresenceChange = (presence: PresenceType) => {
        if (presence.type === 'active' && !isActive) {
            updateUserActiveState().then(activate)
        }
        else if (presence.type === 'idle' && isActive) {
            updateUserActiveState(true).then(deactivate)
        }
    }

    useIdleTimer({ onPresenceChange, timeout: 1000 * 60 * 10 })

    useEffect(() => {
        // Update user availability when the app is opened
        call.get('raven.api.user_availability.refresh_user_active_state', {
            deactivate: false
        })

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                updateUserActiveState().then(activate)
            }
            else {
                updateUserActiveState(true).then(deactivate)
            }
        })

        return () => {
            // Update user availability when the app is closed
            call.get('raven.api.user_availability.refresh_user_active_state', {
                deactivate: true
            })
        }
    }, [])

    return isActive

}