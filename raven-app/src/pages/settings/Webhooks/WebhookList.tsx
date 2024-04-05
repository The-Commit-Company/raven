import { WebhookItem } from "@/components/feature/integrations/webhooks/WebhookItem"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { Flex, Separator, Button, Text, Heading, Box } from "@radix-ui/themes"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"

const WebhookList = () => {

    const { data, error, isLoading, mutate } = useFrappeGetDocList<RavenWebhook>('Raven Webhook', {
        fields: ['name', 'request_url', 'enabled', 'owner', 'creation']
    })

    const navigate = useNavigate()

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-screen">
            <Flex direction='column' gap='4' width='100%' px={'2'}>
                <Flex direction={'column'} gap={'2'} >
                    <Heading>Webhook</Heading>
                    <Text as='span' color='gray' size='2'>Fire webhooks on specific events like when a message is sent or channel is created.</Text>
                </Flex>
                <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                <ErrorBanner error={error} />
                {isLoading && <FullPageLoader className="h-48" text='Loading...' />}
                {data?.length === 0 ? <Text size='2'>No webhooks created.</Text> : <Flex direction='column' gap='4' width='100%'>
                    {data?.map((webhook, index) => (
                        <WebhookItem key={index} webhook={webhook} mutate={mutate} />
                    ))}
                </Flex>}
                <Button onClick={() => navigate('./create')} variant='solid' style={{
                    width: 'fit-content',
                    marginTop: '1rem'
                }} >
                    New Webhook
                </Button>
            </Flex>
        </Box>
    )
}

export const Component = WebhookList