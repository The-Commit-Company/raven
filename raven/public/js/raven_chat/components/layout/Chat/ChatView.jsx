import React, { useEffect } from 'react'
import ChatInput from './ChatInput/ChatInput'

const ChatView = ({ selectedChannel }) => {

    /**
     * We need to hide the chat interface after a delay if the selected channel is empty
     */
    const [show, setShow] = React.useState(selectedChannel ? true : false)

    useEffect(() => {
        if (!selectedChannel) {
            setTimeout(() => {
                setShow(false)
            }, 300)
        } else {
            setShow(true)
        }
    }, [selectedChannel])


    return (
        <div className='raven-chat-view'>
            {show &&
                <div className='raven-chat-view-container'>
                    ChatView {selectedChannel}
                    <ChatInput />
                </div>
            }
        </div>
    )
}

export default ChatView