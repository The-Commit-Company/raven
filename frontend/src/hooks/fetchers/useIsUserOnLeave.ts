import { useFrappeGetCall } from "frappe-react-sdk"
import useRavenSettings from "./useRavenSettings"

const useIsUserOnLeave = (user: string) => {

    // Check if leave status needs to be shown
    const { ravenSettings } = useRavenSettings()

    //@ts-expect-error
    const isHRInstalled = window?.frappe?.boot?.versions?.hrms !== undefined

    const { data } = useFrappeGetCall<{ message: boolean }>("raven.api.raven_users.is_user_on_leave", {
        user: user
    }, ravenSettings?.show_if_a_user_is_on_leave && isHRInstalled ? ["is_user_on_leave", user] : null, {
        // Refresh every 6 hours or on page refresh
        dedupingInterval: 6 * 60 * 60 * 1000,
        revalidateOnFocus: false
    })

    return data?.message ?? false

}

export default useIsUserOnLeave