import { UserContext } from "@/utils/auth/UserProvider"
import { DMChannelListItem, UnreadCountData, useChannelList, useUpdateLastMessageInChannelList } from "@/utils/channel/ChannelListProvider"
import { useFrappeGetCall, FrappeContext, FrappeConfig, useFrappeEventListener } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"

/**
 * Hook to read the unread message count for all channels
 * This only fetches the unread message count for all channels once
 * @returns 
 */
const useUnreadMessageCount = () => {

    const { data: unread_count, mutate: updateCount } = useFrappeGetCall<{ message: UnreadCountData }>("raven.api.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        // Revalidate on focus every minute
        focusThrottleInterval: 60 * 1000,
        // Fetch unread count every 2 minutes
        refreshInterval: 5 * 60 * 1000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    return {
        unread_count,
        updateCount
    }
}

export default useUnreadMessageCount

/**
 *
 * Hook to manage unread message count state with realtime events. This is only used in the sidebar.

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
export const useFetchUnreadMessageCount = () => {

    const { currentUser } = useContext(UserContext)

    const { channels, dm_channels } = useChannelList()

    const { unread_count, updateCount } = useUnreadMessageCount()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const fetchUnreadCountForChannel = async (channelID: string) => {

        // Check if the user has this channel and is a member of the channel
        let channelData = null

        // Search in channels
        const channel = channels.find(c => c.name === channelID && c.member_id)
        if (channel) {
            channelData = channel
        } else {
            // Search in dm_channels
            const dmChannel = dm_channels.find(c => c.name === channelID && c.member_id)
            if (dmChannel) {
                channelData = dmChannel
            }
        }

        if (!channelData) {
            // The event was published for a channel that the user does not have access to
            return
        }


        updateCount(d => {
            if (d) {
                return call.get('raven.api.raven_message.get_unread_count_for_channel', {
                    channel_id: channelID
                }).then((data: { message: number }) => {

                    // Update the unread count for the channel
                    const newChannels = [...d.message]

                    const isChannelAlreadyPresent = d.message.findIndex(c => c.name === channelID)

                    if (isChannelAlreadyPresent === -1) {
                        newChannels.push({
                            is_direct_message: channelData.is_direct_message ? 1 : 0,
                            name: channelID,
                            user_id: (channelData as DMChannelListItem).peer_user_id,
                            unread_count: data.message
                        })
                    } else {
                        newChannels[isChannelAlreadyPresent] = {
                            ...d.message[isChannelAlreadyPresent],
                            unread_count: data.message
                        }
                    }

                    return {
                        message: newChannels
                    }
                }
                )
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
                const newChannels = d.message.map(c => {
                    if (c.name === channel_id)
                        return {
                            ...c,
                            unread_count: 0
                        }
                    return c
                })

                return {
                    message: newChannels
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
            const total_count = unread_count.message.reduce((acc: number, c) => {
                return acc + c.unread_count
            }, 0)

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