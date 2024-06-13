import { Webhook } from '@/types/Integrations/Webhook'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Heading, Section, Separator, Text } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { WebhookForm } from '../../../components/feature/integrations/webhooks/WebhookForm'
import { RavenWebhook } from '@/types/RavenIntegrations/RavenWebhook'
import { BackToList } from '@/components/feature/integrations/webhooks/BackToList'
import { toast } from 'sonner'

const CreateWebhook = () => {

    const navigate = useNavigate()

    const methods = useForm<RavenWebhook>({
        defaultValues: {
            enabled: 1,
            timeout: 5
        }
    })
    const { createDoc, loading, reset, error } = useFrappeCreateDoc()

    const onSubmit = (data: RavenWebhook) => {
        createDoc('Raven Webhook', data)
            .then((doc) => {
                reset()
                methods.reset()
                toast.success("Webhook created")
                return doc
            }).then((doc) => {
                navigate(`../webhooks/${doc.name}`)
            })
    }

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-full">
            <BackToList label="Webhooks" path="/settings/integrations/webhooks" />
            <Flex direction='column' width='100%' mt={'6'}>
                <Flex direction={'row'} gap={'3'} justify={'between'} align={'center'}>
                    <Heading>
                        Create Webhook
                    </Heading>
                    <Button onClick={methods.handleSubmit(onSubmit)} disabled={loading} variant='solid' style={{
                        alignSelf: 'flex-end',
                        marginBottom: '1rem'
                    }} >
                        Save
                    </Button>
                </Flex>
                <Section size={'2'}>
                    <ErrorBanner error={error} />
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <WebhookForm />
                        </form>
                    </FormProvider>
                </Section>

            </Flex>
        </Box>
    )
}

export const Component = CreateWebhook