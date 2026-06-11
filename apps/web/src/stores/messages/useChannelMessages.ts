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
 *
 * `initialBaseMessage` centers the FIRST fetch on a message (deep links) —
 * without it, a plain latest-page load would race the deep link's around-fetch
 * and whichever landed last would win the window.
 */
export const useChannelMessages = (
    channelID: string,
    pinnedMessagesString?: string,
    initialBaseMessage?: string | null,
) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const client = call as FrappeCallClient

    const state = useSyncExternalStore(
        useCallback((onChange) => channelMessagesStore.subscribe(channelID, onChange), [channelID]),
        () => channelMessagesStore.getState(channelID),
    )

    useEffect(() => {
        const current = channelMessagesStore.getState(channelID)
        if (current.status === "idle") {
            loadInitialMessages(client, channelID, initialBaseMessage ?? undefined)
        } else if (current.hasNewerMessages) {
            // A hydrated live-edge window renders instantly from memory, but a
            // DETACHED window (user left while reading history) is stale by
            // definition — discard it and come back to the present (or to the
            // deep-link target, if this visit has one).
            channelMessagesStore.reset(channelID)
            loadInitialMessages(client, channelID, initialBaseMessage ?? undefined)
        }
    }, [channelID])

    const loadOlder = useCallback(() => loadOlderMessages(client, channelID), [channelID])
    const loadNewer = useCallback(() => loadNewerMessages(client, channelID), [channelID])
    const jumpToLatest = useCallback(() => jumpToLatestMessages(client, channelID), [channelID])
    /** Replaces the window with a page centered on the given message. */
    const jumpToMessage = useCallback(
        (messageID: string) => loadInitialMessages(client, channelID, messageID),
        [channelID],
    )

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
        jumpToMessage,
    }
}
