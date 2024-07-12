import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { Loader } from '@/components/common/Loader'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'

interface DeleteImageModalProps {
    onClose: () => void
}

export const DeleteImageModal = ({ onClose }: DeleteImageModalProps) => {

    const { call, error, loading } = useFrappePostCall('frappe.client.set_value')
    const { myProfile, mutate } = useCurrentRavenUser()

    const removeImage = () => {
        call({
            doctype: 'Raven User',
            name: myProfile?.name,
            fieldname: 'user_image',
            value: ''
        }).then(() => {
            toast.success("User status updated")
            mutate()
            onClose()
        })
    }

    return (
        <>
            <AlertDialog.Title>Remove Image</AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={error} />
                <Text>Are you sure you want to remove this image?</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={removeImage} disabled={loading}>
                        {loading && <Loader />}
                        {loading ? "Removing" : "Remove"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}