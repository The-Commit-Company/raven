import { FrappeConfig, FrappeContext, useFrappeEventListener } from 'frappe-react-sdk'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'


interface TypingEventData {
    channel: string,
    users: string[]
}


const useTypingIndicator = (channel: string) => {
    const { socket } = useContext(FrappeContext) as FrappeConfig
    const [typingUsers, setTypingUsers] = useState<string[]>([])

    useEffect(() => {
        if (socket) {
            socket.emit('raven_channel_get_typers', channel)

            socket.io.on("reconnect", () => {
                socket.emit('raven_channel_get_typers', channel)
            })
        }
    }, [channel])

    useFrappeEventListener('raven_channel_typers', (data: TypingEventData) => {
        if (data.channel === channel) {
            setTypingUsers(data.users)
        }
    })

    return typingUsers
}

export const useTyping = (channel: string) => {

    const [typingCounter, setTypingCounter] = useState(0)
    const isTypingRef = useRef(false)

    const { socket } = useContext(FrappeContext) as FrappeConfig

    /** Function to emit typing event to the server */
    const emitStartTyping = useCallback(() => {
        socket?.emit('raven_channel_typing', channel)
    }, [channel])


    /** Function to emit typing stopped event to the server */
    const emitStopTyping = useCallback(() => {
        socket?.emit('raven_channel_typing_stopped', channel)
    }, [channel])

    const onUserType = useCallback(() => {

        // Debounce the typing event to prevent flooding the server with events on fast typing
        if (!isTypingRef.current) {
            isTypingRef.current = true
            setTypingCounter(prev => prev + 1)
            emitStartTyping()
        }

    }, [emitStartTyping])

    // Reset the typing state after a delay if the user is not typing anymore
    // This is to prevent the typing indicator from showing indefinitely
    // If the user does not type for more than 3 seconds, we assume that they are done typing
    useEffect(() => {

        //@ts-ignore
        let timeout: NodeJS.Timeout
        if (typingCounter > 0) {
            // If the typing counter increments with every key press, we reset the timeout
            timeout = setTimeout(() => {
                isTypingRef.current = false
                setTypingCounter(0)
                emitStopTyping()
            }, 10000)
        }

        return () => {
            clearTimeout(timeout)
        }

    }, [typingCounter, emitStopTyping])


    // Stop the typing indicator when the component unmounts
    useEffect(() => {
        return () => {
            emitStopTyping()
        }
    }, [emitStopTyping])


    const stopTyping = useCallback(() => {
        emitStopTyping()
        isTypingRef.current = false
        setTypingCounter(0)
    }, [emitStopTyping])

    return { stopTyping, onUserType }

}

export default useTypingIndicator