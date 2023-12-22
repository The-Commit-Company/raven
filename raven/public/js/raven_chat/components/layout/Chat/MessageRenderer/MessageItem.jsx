import React from 'react'

const MessageItem = ({ message }) => {
    return (
        <div style={{ padding: '8px' }}>
            {message.name}  {message.creation}
        </div>
    )
}

export default MessageItem