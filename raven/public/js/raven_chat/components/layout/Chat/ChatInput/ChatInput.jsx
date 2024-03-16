import React, { useEffect } from 'react'
// import FileUpload from './FileUpload'

const ChatInput = ({ channelID }) => {

    const [text, setText] = React.useState('')
    const sendMessage = () => {

        const content = text.trim()

        if (content.trim().length === 0) return

        frappe.call('raven.api.raven_message.send_message', {
            channel_id: channelID,
            text: content,
            json_content: {
                "content": [
                    {
                        "content": [
                            {
                                "text": content,
                                "type": "text"
                            }
                        ],
                        "type": "paragraph"
                    }
                ],
                "type": "doc"
            },
            is_reply: false,
        }).then(() => {
            setText('')
        })
    }

    return (
        <div className='raven-chat-input'>
            {/* <FileUpload channelID={channelID} /> */}
            <textarea type='text'
                className='form-control'
                rows='1'
                placeholder='Type a message...' value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage()
                    }
                }} />
            <div>
                <button onClick={sendMessage} className='btn btn-md icon-btn btn-default text-muted send-button'>
                    <svg xmlns="http://www.w3.org/2000/svg" className='icon icon-sm' viewBox="0 0 512 512"><path d="M440 6.5L24 246.4c-34.4 19.9-31.1 70.8 5.7 85.9L144 379.6V464c0 46.4 59.2 65.5 86.6 28.6l43.8-59.1 111.9 46.2c5.9 2.4 12.1 3.6 18.3 3.6 8.2 0 16.3-2.1 23.6-6.2 12.8-7.2 21.6-20 23.9-34.5l59.4-387.2c6.1-40.1-36.9-68.8-71.5-48.9zM192 464v-64.6l36.6 15.1L192 464zm212.6-28.7l-153.8-63.5L391 169.5c10.7-15.5-9.5-33.5-23.7-21.2L155.8 332.6 48 288 464 48l-59.4 387.3z" /></svg>
                </button>
            </div>

        </div>
    )

}

export default ChatInput