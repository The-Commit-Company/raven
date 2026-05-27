import { useFrappeGetCall } from "frappe-react-sdk"

/**
 * Returns true if the user is currently on leave (HRMS required).
 * No-op (returns false) when HRMS is not installed.
 */
export function useIsUserOnLeave(user: string) {
    const isHRInstalled = window?.frappe?.boot?.versions?.hrms !== undefined

    const { data } = useFrappeGetCall<{ message: boolean }>(
        "raven.api.raven_users.is_user_on_leave",
        { user },
        isHRInstalled && user ? ["is_user_on_leave", user] : null,
        {
            dedupingInterval: 6 * 60 * 60 * 1000,
            revalidateOnFocus: false,
        }
    )

    return data?.message ?? false
}
