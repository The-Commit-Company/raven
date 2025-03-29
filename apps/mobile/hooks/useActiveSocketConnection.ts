import { FrappeConfig, FrappeContext, useSWR } from "frappe-react-sdk"
import { useContext, useRef } from "react"
import { toast } from "sonner-native"

// Check the socket connection every 2 minutes if the user focuses back on the page
export const useActiveSocketConnection = () => {
    const { socket } = useContext(FrappeContext) as FrappeConfig

    const socketConnectionCount = useRef(0)

    const { data } = useSWR('socket_test', () => {
        return socket?.connected ? true : Promise.reject(new Error('Socket not connected'))
    }, {

        onSuccess: () => {
            socketConnectionCount.current = 0
        },
        onError: (error) => {
            // If the socket connection fails more than 2 times, then show an error message
            if (socketConnectionCount.current === 2) {
                toast.error("Realtime events are not working.", {
                    duration: 5000
                })
            } else {
                // Else try to connect to socket
                socket?.connect()
                socketConnectionCount.current += 1
            }

        },
        errorRetryCount: 3,
    })

    return data
}