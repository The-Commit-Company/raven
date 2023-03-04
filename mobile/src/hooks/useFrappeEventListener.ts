import { useEffect } from 'react'
import socket from '../config/socket'

export const useFrappeEventListener = (eventName: string, callback: (eventData: any) => void) => {

    useEffect(() => {
        let listener = socket.on(eventName, callback)

        return () => {
            listener.off(eventName)
        }
    }, [eventName, callback])

}