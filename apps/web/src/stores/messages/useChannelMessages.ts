import { useCallback, useContext, useEffect, useSyncExternalStore } from "react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import {
    FrappeCallClient,
    jumpToLatestMessages,
    loadInitialMessages,
    loadNewerMessages,
    loadOlderMessages,
} from "./loaders"
import { selectStreamBlocks } from "./selectors"
import { channelMessagesStore } from "./store"

/**
 * Subscribes a component to a channel's message window and triggers the
 * initial fetch. Components only ever read through this hook; all writes
 * go through the store's action methods.
 */
export const useChannelMessages = (channelID: string, pinnedMessagesString?: string) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const client = call as FrappeCallClient

    const state = useSyncExternalStore(
        useCallback((onChange) => channelMessagesStore.subscribe(channelID, onChange), [channelID]),
        () => channelMessagesStore.getState(channelID),
    )

    useEffect(() => {
        if (channelMessagesStore.getState(channelID).status === "idle") {
            loadInitialMessages(client, channelID)
        }
    }, [channelID])

    const loadOlder = useCallback(() => loadOlderMessages(client, channelID), [channelID])
    const loadNewer = useCallback(() => loadNewerMessages(client, channelID), [channelID])
    const jumpToLatest = useCallback(() => jumpToLatestMessages(client, channelID), [channelID])

    return {
        /** Render-ready blocks: messages with continuation/pinned flags + date dividers. */
        blocks: selectStreamBlocks(state, pinnedMessagesString),
        isLoading: state.status === "idle" || state.status === "loading",
        error: state.status === "error" ? state.error : null,
        hasOlderMessages: state.hasOlderMessages,
        /** True when the window is detached from the live edge (show "jump to present"). */
        hasNewerMessages: state.hasNewerMessages,
        loadingOlder: state.loadingOlder,
        loadingNewer: state.loadingNewer,
        loadOlder,
        loadNewer,
        jumpToLatest,
    }
}
