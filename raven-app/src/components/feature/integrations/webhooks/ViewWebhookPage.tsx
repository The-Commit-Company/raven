import { ErrorBanner } from "@/components/layout/AlertBanner"
import { AlertDialog, Badge, Box, Button, DropdownMenu, Flex, IconButton, Section, Text } from "@radix-ui/themes"
import { FrappeDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { FieldValues, FormProvider, useForm } from "react-hook-form"
import { KeyedMutator } from 'swr'
import { BiDotsVerticalRounded } from "react-icons/bi"
import { useState } from "react"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Loader } from "@/components/common/Loader"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { BackToList } from "./BackToList"
import { WebhookForm } from "./WebhookForm"
import { toast } from "sonner"

export const ViewWebhookPage = ({ data, mutate }: { data: FrappeDoc<RavenWebhook>, mutate: KeyedMutator<FrappeDoc<RavenWebhook>> }) => {

    const methods = useForm<RavenWebhook>({
        defaultValues: {
            ...data,
            docstatus: data.docstatus
        }
    })

    const { updateDoc, loading, reset, error } = useFrappeUpdateDoc()

    const isDirty = methods.formState.isDirty

    const onSubmit = async (data: FieldValues) => {
        return updateDoc('Raven Webhook', data.name, data)
            .then((doc) => {
                toast.success("Webhook updated")
                reset()
                mutate()
                if (doc) {
                    methods.reset({
                        ...doc,
                        docstatus: doc.docstatus
                    })
                }
            })
    }

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const onUpdateEnabled = () => {
        updateDoc('Raven Webhook', data.name, {
            enabled: !data.enabled
        }).then((doc) => {
            toast.success(`Webhook ${data.enabled ? 'disabled' : 'enabled'}`)
            reset()
            mutate()
        })
    }

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-full">
            <BackToList label="Webhooks" path="/settings/integrations/webhooks" />
            <Flex direction='column' width='100%' mt={'6'}>
                <Flex direction={'row'} gap={'3'} justify={'between'} align={'center'}>
                    <Flex direction={'row'} gap={'2'} align={'center'}>
                        <Text size='6' weight='bold'>{data?.name}</Text>
                        <Badge color={data.enabled ? 'green' : 'red'}>{data.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </Flex>
                    <Flex gap={'3'}>
                        <Button onClick={methods.handleSubmit(onSubmit)} disabled={loading || !isDirty} variant='solid' style={{
                            alignSelf: 'flex-end',
                            marginBottom: '1rem'
                        }}>
                            Save
                        </Button>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <IconButton aria-label='Options' variant="soft" color="gray" style={{
                                    // @ts-ignore
                                    '--icon-button-ghost-padding': '0',
                                    height: 'var(--base-button-height)',
                                    width: 'var(--base-button-height)',
                                }}>
                                    <BiDotsVerticalRounded />
                                </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content variant='soft'>
                                <DropdownMenu.Item color='gray' onClick={() => setOpen(true)} className="cursor-pointer">
                                    {data.enabled ? 'Disable' : 'Enable'}
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </Flex>
                </Flex>
                <Section size={'2'}>
                    <ErrorBanner error={error} />
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <WebhookForm isEdit={true} />
                        </form>
                    </FormProvider>
                </Section>
            </Flex>
            <AlertDialog.Root open={open} onOpenChange={setOpen}>
                <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                    <AlertDialog.Title>
                        <Text>{data.enabled ? 'Disable' : 'Enable'} Webhook</Text>
                    </AlertDialog.Title>
                    <Flex direction={'column'} gap='2'>
                        <ErrorBanner error={error} />
                        <Text size='2'>Are you sure you want to {data.enabled ? 'disable' : 'enable'} this webhook?</Text>
                    </Flex>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" onClick={onClose}>
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button variant="solid" color={data.enabled ? "red" : "green"} onClick={onUpdateEnabled} disabled={loading}>
                                {loading && <Loader />}
                                {loading ? "Updating" : data.enabled ? "Disable" : "Enable"}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Box >
    )
}