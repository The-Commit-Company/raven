import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '../../../../../types/Messaging/Message'
import { UserContext } from '@/utils/auth/UserProvider'
import { useContext } from 'react'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { BookmarkPlus, BookmarkX } from 'lucide-react'

interface BookmarkButtonProps {
    message: Message,
    updateMessages: () => void
}

export const BookmarkButton = ({ message, updateMessages }: BookmarkButtonProps) => {

    const { currentUser } = useContext(UserContext)
    const { call } = useFrappePostCall('frappe.desk.like.toggle_like')

    const handleLike = (id: string, value: string) => {
        call({
            doctype: 'Raven Message',
            name: id,
            add: value
        }).then((r) => updateMessages())
    }

    const isSaved = JSON.parse(message._liked_by ?? '[]')?.length > 0 && JSON.parse(message._liked_by ?? '[]')?.includes(currentUser)

    return (
        <Tooltip content={isSaved ? 'unsave' : 'save'}>
            <IconButton
                variant='soft'
                aria-label='save message'
                size='1'
                color='gray'
                onClick={() => handleLike(message.name, isSaved ? 'No' : 'Yes')}>
                {isSaved ? <BookmarkX size='14' color='red' /> : <BookmarkPlus size='14' />}
            </IconButton>
        </Tooltip>
    )
}