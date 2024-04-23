import { WebhookItem } from "@/components/feature/integrations/webhooks/WebhookItem"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { Flex, Button, Text, Heading, Box, Blockquote, Section } from "@radix-ui/themes"
import { useFrappeDocTypeEventListener, useFrappeGetDocList } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"

const WebhookList = () => {

    const { data, error, isLoading, mutate } = useFrappeGetDocList<RavenWebhook>('Raven Webhook', {
        fields: ['name', 'request_url', 'enabled', 'owner', 'creation']
    })

    const navigate = useNavigate()

    useFrappeDocTypeEventListener('Raven Webhook', () => {
        mutate()
    })

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-screen">
            <Flex justify={'between'}>
                <Heading>Webhooks</Heading>
                <Button onClick={() => navigate('./create')}>Add</Button>
            </Flex>
            <Section size={'2'}>
                <Blockquote size={'2'}>
                    Fire webhooks on specific events like when a message is sent or channel is created.
                </Blockquote>
            </Section>
            <Flex direction={'column'}>
                <ErrorBanner error={error} />
                {isLoading && <FullPageLoader className="h-auto" text='Loading...' />}
                {data?.length === 0 ? null : <Flex direction='column' gap='4' width='100%'>
                    {data?.map((webhook, index) => (
                        <WebhookItem key={index} webhook={webhook} mutate={mutate} />
                    ))}
                </Flex>}
            </Flex>
        </Box>
    )
}

export const Component = WebhookList