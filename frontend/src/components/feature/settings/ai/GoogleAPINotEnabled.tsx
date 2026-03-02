import { BiInfoCircle } from "react-icons/bi"
import { Text } from "@radix-ui/themes"
import useRavenSettings from "@/hooks/fetchers/useRavenSettings"
import { CustomCallout } from "@/components/common/Callouts/CustomCallout"

const GoogleAPINotEnabledCallout = () => {

    const { ravenSettings } = useRavenSettings()

    // Check if AI is enabled and at least one provider is configured
    const hasGoogleApis = ravenSettings?.enable_google_apis === 1
    const hasGoogleProjectID = ravenSettings?.google_project_id !== ''

    if (hasGoogleApis && hasGoogleProjectID) {
        return null
    }

    const message = !hasGoogleApis
        ? "Google APIs are not enabled. Please enable them in Raven Settings"
        : "No Google Project ID is set. Please set a Project ID in Raven Settings"

    return (
        <CustomCallout
            iconChildren={<BiInfoCircle size='18' />}
            rootProps={{ color: 'blue', variant: 'surface' }}
            textChildren={<Text>{message}</Text>}
        />
    )
}

export default GoogleAPINotEnabledCallout
