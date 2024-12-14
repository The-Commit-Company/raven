import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook"
import { DateMonthYear } from "@/utils/dateConversions"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Flex, Badge, IconButton, AlertDialog, Text, Button } from "@radix-ui/themes"
import { useState } from "react"
import { BiTrash } from "react-icons/bi"
import { useNavigate } from "react-router-dom"
import { AlertContent } from "../../settings/common/DeleteAlert"
import { toast } from "sonner"
import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { AiOutlineEdit } from "react-icons/ai"

export const WebhookItem = ({ webhook, mutate }: { webhook: RavenWebhook, mutate: () => void }) => {

    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Flex direction='column' gap='2' width='100%' justify={'between'} className="border border-gray-4 dark:border-gray-6 rounded-radius2 p-3">
            <Flex direction='row' align='center' justify='between'>
                <Flex direction='column' gap='1'>
                    <Flex direction={'row'} gap={'2'}>
                        <Text size={'2'} weight={'bold'}>{webhook.name}</Text>
                        <Badge color={webhook.enabled ? 'green' : 'red'}>{webhook.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </Flex>
                    <Text size='1' style={{
                        fontStyle: 'italic',
                        color: 'gray'
                    }}>Created by {webhook.owner} on <DateMonthYear date={webhook.creation} /></Text>
                </Flex>
                <Flex direction={'row'} gap={'2'} align={'center'}>
                    <IconButton
                        variant="ghost"
                        color="gray"
                        aria-label="Click to edit webhook"
                        title='Edit webhook'
                        onClick={() => navigate(`./${webhook.name}`)}
                        style={{
                            // @ts-ignore
                            '--icon-button-ghost-padding': '0',
                            height: 'var(--base-button-height)',
                            width: 'var(--base-button-height)',
                        }}>
                        <AiOutlineEdit size='16' />
                    </IconButton>
                    <AlertDialog.Root open={open} onOpenChange={setOpen}>
                        <AlertDialog.Trigger>
                            <IconButton
                                variant="ghost"
                                color="red"
                                aria-label="Click to delete webhook"
                                title='Delete webhook'
                                onClick={() => { }}
                                style={{
                                    // @ts-ignore
                                    '--icon-button-ghost-padding': '0',
                                    height: 'var(--base-button-height)',
                                    width: 'var(--base-button-height)',
                                }}>
                                <BiTrash size='16' />
                            </IconButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                            <AlertContent doctype="Raven Webhook" docname={webhook.name} onClose={onClose} onUpdate={mutate} />
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                </Flex>
            </Flex>
        </Flex>
    )
}
const DeleteWebhookAlertContent = ({ webhhookID, onClose, mutate }: { webhhookID: string, onClose: () => void, mutate: () => void }) => {

    const { deleteDoc, error, loading } = useFrappeDeleteDoc()

    const onDelete = () => {
        deleteDoc('Raven Webhook', webhhookID).then(() => {
            mutate()
            onClose()
            toast.error('Webhook deleted.')
        })
    }

    return (
        <>
            <AlertDialog.Title>
                <Text>{webhhookID}</Text>
            </AlertDialog.Title>
            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={error} />
                <Text size='2'>Are you sure you want to delete this webhook?</Text>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" onClick={onClose}>
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={onDelete} disabled={loading}>
                        {loading && <Loader className="text-white" />}
                        {loading ? "Deleting" : `Delete`}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )

}