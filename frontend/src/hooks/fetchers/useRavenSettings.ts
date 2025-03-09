import { RavenSettings } from "@/types/Raven/RavenSettings"
import { useFrappeGetDoc } from "frappe-react-sdk"

const useRavenSettings = () => {

    const { data, mutate, error } = useFrappeGetDoc<RavenSettings>("Raven Settings", "Raven Settings", "raven_settings", {
        revalidateOnFocus: false,
        // Refresh every 8 hours or on page refresh
        dedupingInterval: 8 * 60 * 60 * 1000
    })

    return {
        ravenSettings: data,
        mutate,
        error
    }
}

export default useRavenSettings