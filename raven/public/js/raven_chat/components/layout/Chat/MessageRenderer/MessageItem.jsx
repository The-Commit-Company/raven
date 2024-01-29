import React from 'react'
import useGetUser from '../../../../hooks/useGetUser'
import Avatar from '../../../common/Avatar'
import ImageMessageBlock from './renderers/ImageMessageBlock'
import TiptapRenderer from './renderers/TiptapRenderer'
import FileMessageBlock from './renderers/FileMessageBlock'
const MessageItem = ({ message }) => {

    const { name, owner: userID, creation: timestamp, message_reactions, is_continuation, is_reply, linked_message } = message
    const { user, isActive } = useGetUserDetails(userID)

    const isOwner = frappe.session.user === userID

    return (
        <div style={{ paddingLeft: '4px', paddingRight: '4px  ' }} data-message-id={message.name} className='message-item'>
            <MessageLeftElement message={message} user={user} isActive={isActive} />
            <div>
                <MessageHeader message={message} user={user} />

                {/* Message content goes here */}

                {/* TODO: If it's a reply, then show the linked message */}

                {/* Show message according to type */}
                <MessageContent message={message} user={user} />

                {/** TODO: Show message reactions */}
            </div>
        </div>
    )
}

const useGetUserDetails = (userID) => {

    const user = useGetUser(userID)

    //TODO: Implement useIsUserActive
    // const isActive = useIsUserActive(userID)
    const isActive = false

    return { user, isActive }
}

const MessageLeftElement = ({ message, user, isActive }) => {
    return <div>
        {message.is_continuation ? <div style={{
            width: "1.8rem",
            height: "1.8rem",
        }}></div> :
            <Avatar user={user} isActive={isActive} />
        }
    </div>
}

const MessageHeader = ({ message, user }) => {
    if (message.is_continuation) return null
    return <div className='raven-message-item-header'>
        <span className='raven-message-item-header-name'>{user?.full_name}</span>
        <span className='raven-message-item-header-time'>{moment(message.creation, frappe.defaultDatetimeFormat).format('HH:mm A')}</span>
    </div>
}

const MessageContent = ({ message, user }) => {
    return <div>
        {message.text && <TiptapRenderer message={{
            ...message,
            message_type: 'Text'
        }} />}
        {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}
        {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}
    </div>
}

export default MessageItem