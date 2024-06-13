import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { Box } from "@radix-ui/themes"
import { useFrappeGetDoc } from "frappe-react-sdk"
import { useParams } from "react-router-dom"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { ViewWebhookPage } from "@/components/feature/integrations/webhooks/ViewWebhookPage"

const ViewWebhook = () => {

    const { ID } = useParams<{ ID: string }>()
    const { data, error, isLoading, mutate } = useFrappeGetDoc<RavenWebhook>('Raven Webhook', ID, undefined, {
        shouldRetryOnError: false,
    })

    return (
        <Box>
            {isLoading && <FullPageLoader />}
            {error && <ErrorBanner error={error} />}
            {data && <ViewWebhookPage data={data} mutate={mutate} />}

        </Box>
    )
}

export const Component = ViewWebhook