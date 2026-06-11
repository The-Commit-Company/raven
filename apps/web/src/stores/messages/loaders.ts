import { channelMessagesStore } from "./store"
import { MessagesPage } from "./types"

const PAGE_SIZE = 30

/** Minimal client shape — `call` from FrappeContext. */
export type FrappeCallClient = {
    get: <T>(method: string, params?: Record<string, unknown>) => Promise<T>
}

type PageResponse = { message: MessagesPage }

const inFlight = new Set<string>()

/**
 * IO layer: fetches pages and feeds them to the store.
 * Responses always apply to the channel they were requested for,
 * so a channel switch mid-flight cannot corrupt another channel's state.
 */

/** Loads the window — latest messages, or around `baseMessage` when jumping to one. */
export const loadInitialMessages = async (
    client: FrappeCallClient,
    channelID: string,
    baseMessage?: string,
) => {
    // Keyed per base message so a jump-to-message isn't swallowed by an in-flight initial load
    const key = `${channelID}:initial:${baseMessage ?? ""}`
    if (inFlight.has(key)) return
    inFlight.add(key)
    channelMessagesStore.startLoading(channelID)
    try {
        const response = await client.get<PageResponse>("raven.api.chat_stream.get_messages", {
            channel_id: channelID,
            limit: PAGE_SIZE,
            base_message: baseMessage,
        })
        channelMessagesStore.setInitialPage(channelID, response.message)
    } catch (error) {
        channelMessagesStore.failLoading(channelID, errorMessage(error))
    } finally {
        inFlight.delete(key)
    }
}

export const loadOlderMessages = async (client: FrappeCallClient, channelID: string) => {
    if (!channelMessagesStore.beginPagination(channelID, "older")) return
    const oldestID = channelMessagesStore.getState(channelID).order[0]
    try {
        const response = await client.get<PageResponse>("raven.api.chat_stream.get_older_messages", {
            channel_id: channelID,
            from_message: oldestID,
            limit: PAGE_SIZE,
        })
        channelMessagesStore.setOlderPage(channelID, response.message)
    } catch {
        channelMessagesStore.endPagination(channelID, "older")
    }
}

export const loadNewerMessages = async (client: FrappeCallClient, channelID: string) => {
    if (!channelMessagesStore.beginPagination(channelID, "newer")) return
    const state = channelMessagesStore.getState(channelID)
    const newestID = state.order[state.order.length - 1]
    try {
        const response = await client.get<PageResponse>("raven.api.chat_stream.get_newer_messages", {
            channel_id: channelID,
            from_message: newestID,
            limit: PAGE_SIZE,
        })
        channelMessagesStore.setNewerPage(channelID, response.message)
    } catch {
        channelMessagesStore.endPagination(channelID, "newer")
    }
}

/** Discards the detached window and refetches the live edge. */
export const jumpToLatestMessages = async (client: FrappeCallClient, channelID: string) => {
    channelMessagesStore.reset(channelID)
    await loadInitialMessages(client, channelID)
}

const errorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return "Failed to load messages"
}
