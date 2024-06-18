import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { toast } from 'sonner'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { useUserData } from '@/hooks/useUserData'

interface DeleteImageModalProps {
    onClose: () => void
}

export const DeleteImageModal = ({ onClose }: DeleteImageModalProps) => {

    const { updateDoc, error, loading } = useFrappeUpdateDoc()
    const userData = useUserData()

    const removeImage = () => {
        updateDoc('Raven User', userData.name, {
            'user_image': null
        }).then(() => {
            onClose()
            toast.success("Image removed successfully")
        }).catch(() => {
            toast("Could not remove image")
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