import React from 'react'
// import FileUpload from './FileUpload'

const ChatInput = ({ channelID }) => {

    const sendMessage = (content, json) => {
        frappe.call('raven.raven_messaging.doctype.raven_message.raven_message.send_message', {
            channel_id: channelID,
            text: content,
            json: json,
        })
    }
    return (
        <div className='raven-chat-input'>
            {/* <FileUpload channelID={channelID} /> */}
            <input type='text' placeholder='Type a message...' onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    sendMessage(e.target.value)
                    e.target.value = ''
                }
            }} />
        </div>
    )
}

export default ChatInput