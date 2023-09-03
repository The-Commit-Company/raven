import { IconButton, Tooltip } from '@chakra-ui/react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { IoBookmark, IoBookmarkOutline } from 'react-icons/io5'
import { Message } from '../../../../../types/Messaging/Message'

interface BookmarkButtonProps {
    message: Message,
    updateMessages: () => void
    currentUser: string
}

export const BookmarkButton = ({ message, updateMessages, currentUser }: BookmarkButtonProps) => {

    const { call } = useFrappePostCall('frappe.desk.like.toggle_like')

    const handleLike = (id: string, value: string) => {
        call({
            doctype: 'Raven Message',
            name: id,
            add: value
        }).then((r) => updateMessages())
    }

    const checkLiked = (likedBy: string) => {
        return JSON.parse(likedBy ?? '[]')?.length > 0 && JSON.parse(likedBy ?? '[]')?.includes(currentUser)
    }

    return (
        <Tooltip hasArrow label={checkLiked(message._liked_by) ? 'unsave' : 'save'} size='xs' placement='top' rounded='md'>
            <IconButton
                aria-label="save message"
                icon={checkLiked(message._liked_by) ? <IoBookmark fontSize={'0.8rem'} /> : <IoBookmarkOutline fontSize={'0.8rem'} />}
                size='xs'
                onClick={() => handleLike(message.name, checkLiked(message._liked_by) ? 'No' : 'Yes')} />
        </Tooltip>
    )
}