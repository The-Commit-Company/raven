import { ChannelList } from "@raven/types/common/ChannelListItem"
import { FrappeConfig, FrappeContext, useSWRConfig } from "frappe-react-sdk"
import { useContext } from "react"

export const useUpdateLastMessageInChannelList = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const updateLastMessageInChannelList = async (channelID: string) => {

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
                    return call.get('raven.api.raven_channel.get_last_message_details', {
                        channel_id: channelID,
                    }).then(res => {
                        if (res && res.message) {
                            // Update the last message details in the channel list
                            let newChannels = channelList.message.channels
                            let newDMChannels = channelList.message.dm_channels

                            if (isMainChannel) {
                                newChannels = newChannels.map((channel) => {
                                    if (channel.name === channelID) {
                                        return {
                                            ...channel,
                                            last_message_details: res.message.last_message_details,
                                            last_message_timestamp: res.message.last_message_timestamp
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
                                            last_message_details: res.message.last_message_details,
                                            last_message_timestamp: res.message.last_message_timestamp
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
                        else {
                            return channelList
                        }
                    }
                    )
                } else {
                    return channelList
                }
            } else {
                return channelList
            }

        }, {
            revalidate: false
        })
    }

    return { updateLastMessageInChannelList }

}