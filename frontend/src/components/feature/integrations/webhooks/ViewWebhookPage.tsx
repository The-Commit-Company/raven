import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { AlertDialog, Button, DropdownMenu, Flex, IconButton, Text } from "@radix-ui/themes"
import { FrappeDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { FieldValues, FormProvider, useForm } from "react-hook-form"
import { KeyedMutator } from 'swr'
import { BiDotsVerticalRounded } from "react-icons/bi"
import { useEffect, useState } from "react"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Loader } from "@/components/common/Loader"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { WebhookForm } from "./WebhookForm"
import { toast } from "sonner"
import { isEmpty } from "@/utils/validations"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader, { HeaderBadge } from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"

export const ViewWebhookPage = ({ data, mutate }: { data: FrappeDoc<RavenWebhook>, mutate: KeyedMutator<FrappeDoc<RavenWebhook>> }) => {

    const methods = useForm<RavenWebhook>({
        defaultValues: {
            ...data,
            docstatus: data.docstatus
        }
    })

    const { updateDoc, loading, reset, error } = useFrappeUpdateDoc()

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)

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
        }).then(() => {
            toast.success(`Webhook ${data.enabled ? 'disabled' : 'enabled'}`)
            reset()
            mutate()
        })
    }

    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                methods.handleSubmit(onSubmit)()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const Badges: HeaderBadge[] = data?.enabled ? [{ label: "Enabled", color: "green" }] : [{ label: "Disabled", color: "gray" }]

    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : Badges}
                    actions={<HStack>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <IconButton aria-label='Options' variant="surface" color="gray">
                                    <BiDotsVerticalRounded />
                                </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content className="min-w-32">
                                <DropdownMenu.Item color='gray' onClick={() => setOpen(true)}>
                                    {data.enabled ? 'Disable' : 'Enable'}
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Webhooks', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <WebhookForm isEdit={true} />
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
                                <Button variant="solid" color={data.enabled ? "red" : undefined} onClick={onUpdateEnabled} disabled={loading}>
                                    {loading && <Loader />}
                                    {loading ? "Updating" : data.enabled ? "Disable" : "Enable"}
                                </Button>
                            </AlertDialog.Action>
                        </Flex>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            </SettingsContentContainer>
        </FormProvider>
    </form>
}