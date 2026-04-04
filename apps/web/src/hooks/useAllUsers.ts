import { useFrappeGetCall } from "frappe-react-sdk"
import type { UserFields } from "@raven/types/common/UserFields"

const USERS_LIST_KEY = "raven.api.raven_users.get_list"

/**
 * Fetches all Raven users for use in selects (e.g. channel/DM picker, user filter).
 * Uses the same API as useLoadUsers. Result is cached; pass enabled: false to skip
 * fetching until needed (e.g. when a modal that needs the list is open).
 *
 * TODO: At scale (1000+ users), consider a search API + lazy load instead of loading all.
 */
export function useAllUsers(options?: { enabled?: boolean }) {
    const enabled = options?.enabled !== false
    const { data } = useFrappeGetCall<{ message: UserFields[] }>(
        "raven.api.raven_users.get_list",
        undefined,
        enabled ? USERS_LIST_KEY : null,
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    )
    return data?.message ?? []
}
