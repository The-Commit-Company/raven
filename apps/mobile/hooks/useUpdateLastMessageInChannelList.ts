import { ChannelList } from "@raven/types/common/ChannelListItem"
import { useSWRConfig } from "frappe-react-sdk"

export const useUpdateLastMessageInChannelList = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const updateLastMessageInChannelList = async (channelID: string, lastMessageTimestamp: string, lastMessageDetails?: any) => {

        globalMutate(`channel_list`, async (channelList?: { message: ChannelList }) => {
            if (channelList) {

                let isChannelPresent = channelList.message.channels.find((channel) => channel.name === channelID)
                let isMainChannel = isChannelPresent ? true : false
                let isDMChannel = false
                if (!isChannelPresent) {
                    isChannelPresent = channelList.message.dm_channels.find((channel) => channel.name === channelID)
                    isDMChannel = isChannelPresent ? true : false
                }

                if (isChannelPresent) {
                    // Update the last message details in the channel list
                    let newChannels = channelList.message.channels
                    let newDMChannels = channelList.message.dm_channels

                    if (isMainChannel) {
                        newChannels = newChannels.map((channel) => {
                            if (channel.name === channelID) {
                                return {
                                    ...channel,
                                    last_message_timestamp: lastMessageTimestamp,
                                }
                            }
                            return channel
                        })
                    }

                    if (isDMChannel) {
                        newDMChannels = newDMChannels.map((channel) => {
                            if (channel.name === channelID) {
                                return {
                                    ...channel,
                                    last_message_timestamp: lastMessageTimestamp,
                                    last_message_details: lastMessageDetails || channel.last_message_details
                                }
                            }
                            return channel
                        })
                    }

                    return {
                        message: {
                            channels: newChannels,
                            dm_channels: newDMChannels,
                        }
                    }
                }
            }

            // If nothing changed, return the same channel list
            return channelList

        }, {
            revalidate: false
        })
    }

    return { updateLastMessageInChannelList }

}