import { Webhook } from '@/types/Integrations/Webhook'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { WebhookForm } from '../../../components/feature/integrations/webhooks/WebhookForm'
import { useToast } from '@/hooks/useToast'
import { RavenWebhook } from '@/types/RavenIntegrations/RavenWebhook'
import { BackToList } from '@/components/feature/integrations/webhooks/BackToList'

const CreateWebhook = () => {

    const navigate = useNavigate()

    const methods = useForm<RavenWebhook>({
        defaultValues: {
            enabled: 1,
            timeout: 5
        }
    })
    const { createDoc, loading, reset, error } = useFrappeCreateDoc()

    const { toast } = useToast()

    const onSubmit = (data: RavenWebhook) => {
        createDoc('Raven Webhook', data)
            .then((doc) => {
                reset()
                methods.reset()
                toast({
                    title: "Webhook created successfully.",
                    variant: 'success',
                })
                return doc
            }).then((doc) => {
                navigate(`../webhooks/${doc.name}`)
            })
    }

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-full">
            <Flex direction='column' gap='4' width='100%'>
                <BackToList />
                <Flex direction='column' gap='4' width='100%' px={'2'}>
                    <Heading>
                        Create Webhook
                    </Heading>
                    <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                    <ErrorBanner error={error} />
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <WebhookForm />
                        </form>
                    </FormProvider>
                    <Button onClick={methods.handleSubmit(onSubmit)} disabled={loading} variant='solid' style={{
                        alignSelf: 'flex-end',
                        marginBottom: '1rem'
                    }} >
                        Create Webhook
                    </Button>
                </Flex>
            </Flex>
        </Box>

    )
}

export const Component = CreateWebhook