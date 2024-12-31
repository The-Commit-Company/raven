import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { ErrorBanner } from "../../../../layout/AlertBanner/ErrorBanner"
import { AlertDialog, Button, Callout, Flex, Text } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { FiAlertTriangle } from "react-icons/fi"
import { Message } from "../../../../../../../types/Messaging/Message"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface DeleteMessageModalProps {
    onClose: (refresh?: boolean) => void,
    message: Message
}

export const DeleteMessageModal = ({ onClose, message }: DeleteMessageModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
    const navigate = useNavigate()

    const onSubmit = async () => {
        return deleteDoc('Raven Message', message.name).then(() => {
            toast('Message deleted', {
                duration: 800
            })
            message.is_thread && navigate(`/channel/${message.channel_id}`)
            onClose()
        })
    }

    return (
        <>
            <AlertDialog.Title>
                Delete {message.is_thread ? 'Thread' : 'Message'}
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <Callout.Root color="red" size='1'>
                    <Callout.Icon>
                        <FiAlertTriangle size='18' />
                    </Callout.Icon>
                    <Callout.Text size='2'>
                        This action is permanent and cannot be undone.
                    </Callout.Text>
                </Callout.Root>

                <ErrorBanner error={error} />
                {message.is_thread ? <Text size='2'>This message is a thread, deleting it will delete all messages in the thread.</Text> :
                    <Text size='2'>Are you sure you want to delete this message? It will be deleted for all users.</Text>}
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={onSubmit} disabled={deletingDoc}>
                        {deletingDoc && <Loader className="text-white" />}
                        {deletingDoc ? "Deleting" : "Delete"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}