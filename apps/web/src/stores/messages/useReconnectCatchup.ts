import { useContext, useEffect } from "react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { catchUpNewerMessages, type FrappeCallClient } from "./loaders"
import { channelMessagesStore } from "./store"

/**
 * Realtime is best-effort: a disconnect drops the message events for every room
 * we're in. On reconnect, refetch anything that landed during the gap for each
 * warm, live-edge channel — the missed-events backstop behind the live
 * subscriptions. Detached/idle windows are skipped by catchUpNewerMessages.
 */
export const useReconnectCatchup = () => {
    const { socket, call } = useContext(FrappeContext) as FrappeConfig

    useEffect(() => {
        if (!socket) return
        const onReconnect = () => {
            const client = call as FrappeCallClient
            for (const channelID of channelMessagesStore.getHydratedChannelIDs()) {
                catchUpNewerMessages(client, channelID)
            }
        }
        socket.io.on("reconnect", onReconnect)
        return () => {
            socket.io.off("reconnect", onReconnect)
        }
    }, [socket, call])
}
