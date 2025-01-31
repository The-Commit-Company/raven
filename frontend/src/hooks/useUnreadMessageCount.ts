import { UserContext } from "@/utils/auth/UserProvider"
import { UnreadCountData, useUpdateLastMessageInChannelList } from "@/utils/channel/ChannelListProvider"
import { useFrappeGetCall, FrappeContext, FrappeConfig, useFrappeEventListener } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"

/**
 *
 * Hook to manage unread message count

    For every channel member, we store a last_visit timestamp in the Raven Channel Member doctype. To get the number of unread messages, we can simply look at the no. of messages created after this timestamp for any given channel.

    The last_visit for a member of a channel is updated when:
    1. Latest messages are fetched (usually when a channel is opened)- this is in the get_messages API under chat_stream
    2. The user fetches newer messages (let's say they were viewing a saved message (older) and scrolled down until they reached the bottom of the chat stream). This is in the get_newer_messages API under chat_stream.
    3. When the user sends a new message (handled by controller under Raven Message)
    4. When the user exits a channel after all the latest messages had been loaded (called from the frontend)

    When Raven loads, we fetch the unread message counts for all channels. Post that, updates to these counts are made when:
    1. If a user opens a channel directly (no base message) - we locally update the unread message count to 0 - no API call
    2. If a realtime event is published for unread message count change and the sender is not the user itself - we only fetch the unread count for the particular channel (instead of all channels like we used to).

    The realtime event for unread message count changed is published when:
    1. A new message is sent
    2. A message is deleted
    3. The user scrolls to the bottom of the chat stream from a base message.

 * @returns unread_count - The unread message count for the current user
 */
const useUnreadMessageCount = () => {

    const { currentUser } = useContext(UserContext)
    const { data: unread_count, mutate: updateCount } = useFrappeGetCall<{ message: UnreadCountData }>("raven.api.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    })

    const { call } = useContext(FrappeContext) as FrappeConfig

    const fetchUnreadCountForChannel = async (channelID: string) => {

        updateCount(d => {
            if (d) {
                // If the channel ID is present in the unread count, then fetch and update the unread count for the channel
                if (d.message.channels.find(c => c.name === channelID)) {
                    return call.get('raven.api.raven_message.get_unread_count_for_channel', {
                        channel_id: channelID
                    }).then((data: { message: number }) => {
                        const newChannels = d.message.channels.map(c => {
                            if (c.name === channelID)
                                return {
                                    ...c,
                                    unread_count: data.message
                                }
                            return c
                        })

                        const total_unread_count_in_channels = newChannels.reduce((acc: number, c) => {
                            if (!c.is_direct_message) {
                                return acc + c.unread_count
                            } else {
                                return acc
                            }
                        }, 0)

                        const total_unread_count_in_dms = newChannels.reduce((acc: number, c) => {
                            if (c.is_direct_message) {
                                return acc + c.unread_count
                            } else {
                                return acc
                            }
                        }, 0)

                        return {
                            message: {
                                total_unread_count_in_channels,
                                total_unread_count_in_dms,
                                channels: newChannels
                            }
                        }
                    }
                    )
                } else {
                    return d
                }
            } else {
                return d
            }
        }, {
            revalidate: false
        })
    }

    const { channelID } = useParams()
    const { state } = useLocation()

    const { updateLastMessageInChannelList } = useUpdateLastMessageInChannelList()

    useFrappeEventListener('raven:unread_channel_count_updated', (event) => {
        // If the event is published by the current user, then update the unread count to 0
        if (event.sent_by !== currentUser) {
            // If the user is already on the channel and is at the bottom of the chat (no base message), then update the unread count to 0
            if (channelID === event.channel_id && !state?.baseMessage) {
                // Update the unread count on the channel to 0
                updateUnreadCountToZero(channelID)

            } else {
                //TODO: perf: Can try to just increment the count by one instead of fetching the count again
                // https://github.com/The-Commit-Company/Raven/pull/745#issuecomment-2014313429
                fetchUnreadCountForChannel(event.channel_id)
            }
        } else {
            updateUnreadCountToZero(event.channel_id)
        }

        updateLastMessageInChannelList(event.channel_id, event.last_message_timestamp)
    })

    const updateUnreadCountToZero = (channel_id?: string) => {

        updateCount(d => {
            if (d) {
                const newChannels = d.message.channels.map(c => {
                    if (c.name === channel_id)
                        return {
                            ...c,
                            unread_count: 0
                        }
                    return c
                })

                const total_unread_count_in_channels = newChannels.reduce((acc: number, c) => {
                    if (!c.is_direct_message) {
                        return acc + c.unread_count
                    } else {
                        return acc
                    }
                }, 0)

                const total_unread_count_in_dms = newChannels.reduce((acc: number, c) => {
                    if (c.is_direct_message) {
                        return acc + c.unread_count
                    } else {
                        return acc
                    }
                }, 0)

                return {
                    message: {
                        total_unread_count_in_channels,
                        total_unread_count_in_dms,
                        channels: newChannels
                    }
                }

            } else {
                return d
            }

        }, { revalidate: false })

    }

    useEffect(() => {
        // @ts-expect-error
        const app_name = window.app_name || "Raven"
        if (unread_count) {
            const total_count = unread_count.message.total_unread_count_in_channels + unread_count.message.total_unread_count_in_dms

            // Update document title with unread message count
            if (total_count > 0) {
                document.title = `(${total_count}) ${app_name}`
            } else {
                document.title = app_name
            }
        } else {
            document.title = app_name
        }
    }, [unread_count])

    return unread_count
}

export default useUnreadMessageCount