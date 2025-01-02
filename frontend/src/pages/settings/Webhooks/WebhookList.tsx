import { WebhookItem } from "@/components/feature/integrations/webhooks/WebhookItem"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from "@/components/layout/EmptyState/EmptyListViewState"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { isSystemManager } from "@/utils/roles"
import { Flex, Button } from "@radix-ui/themes"
import { useFrappeDocTypeEventListener, useFrappeGetDocList } from "frappe-react-sdk"
import { LuWebhook } from "react-icons/lu"
import { Link } from "react-router-dom"

const WebhookList = () => {

    const isRavenAdmin = isSystemManager()

    const { data, error, isLoading, mutate } = useFrappeGetDocList<RavenWebhook>('Raven Webhook', {
        fields: ['name', 'request_url', 'enabled', 'owner', 'creation']
    }, isRavenAdmin ? undefined : null, {
        errorRetryCount: 2
    })

    useFrappeDocTypeEventListener('Raven Webhook', () => {
        mutate()
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Webhooks'
                    description='Fire webhooks on specific events like when a message is sent or channel is created.'
                    actions={<Button asChild disabled={!isRavenAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {data?.length === 0 ? null : <Flex direction='column' gap='4' width='100%' className="animate-fadein">
                    {data?.map((webhook, index) => (
                        <WebhookItem key={index} webhook={webhook} mutate={mutate} />
                    ))}
                </Flex>}
                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <LuWebhook />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Webhooks</EmptyStateTitle>
                    <EmptyStateDescription>
                        Webhooks allow you to receive HTTP requests whenever a specific event occurs - like when a message is sent or a channel is created.
                    </EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first webhook
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

export const Component = WebhookList