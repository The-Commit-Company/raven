import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack } from '@/components/layout/Stack'
import { AlertDialog, Button, IconButton } from '@radix-ui/themes'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { BiTrash } from 'react-icons/bi'

type Props = {
    emojiID: string
    onDelete: () => void
}

const DeleteCustomEmojiDialog = ({ emojiID, onDelete }: Props) => {

    const { deleteDoc, loading, error } = useFrappeDeleteDoc()

    const handleDelete = async () => {
        await deleteDoc('Raven Custom Emoji', emojiID)
        onDelete()
    }

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <IconButton color='red' variant='soft' size='2' className='group-hover:visible invisible'>
                    <BiTrash />
                </IconButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Title>Delete Emoji</AlertDialog.Title>
                <AlertDialog.Description>Are you sure you want to delete this emoji?</AlertDialog.Description>
                {error && <ErrorBanner error={error} />}
                <HStack justify='end' gap='2' pt='2'>
                    <AlertDialog.Cancel>
                        <Button disabled={loading} color='gray' variant='soft'>Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action onClick={handleDelete} disabled={loading}>
                        <Button color='red' disabled={loading}>Delete</Button>
                    </AlertDialog.Action>
                </HStack>

            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}

export default DeleteCustomEmojiDialog