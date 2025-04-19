import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box, Flex, Link, Separator, Text } from '@radix-ui/themes'
import { MessageSenderAvatar, MessageContent, UserHoverCard } from "../chat/ChatMessage/MessageItem"
import { useGetUser } from "@/hooks/useGetUser"
import { Message } from "../../../../../types/Messaging/Message"
import { useMemo } from "react"
import { DateMonthYear } from "@/utils/dateConversions"

type MessageBoxProps = {
    message: Message & { workspace?: string }
    handleScrollToMessage?: (messageName: string, channelID: string, workspace?: string) => void
}

export const MessageBox = ({ message, handleScrollToMessage }: MessageBoxProps) => {

    const { owner, creation, channel_id } = message
    const users = useGetUserRecords()

    const user = useGetUser(message.is_bot_message && message.bot ? message.bot : message.owner)
    const { channel } = useCurrentChannelData(channel_id)
    const channelData = channel?.channelData

    const channelName = useMemo(() => {
        if (channelData) {
            if (channelData.is_direct_message) {
                const peer_user_name = users[(channelData as DMChannelListItem).peer_user_id]?.full_name ?? (channelData as DMChannelListItem).peer_user_id
                return `DM with ${peer_user_name}`
            } else {
                return channelData.channel_name
            }
        }
    }, [channelData])

    return (
        <Flex direction='column' gap='2' className="group
        hover:bg-gray-100
                            dark:hover:bg-gray-4
                            p-2
                            rounded-md">
            <Flex gap='2'>
                <Text as='span' size='1'>{channelName}</Text>
                <Separator orientation='vertical' />
                <Text as='span' size='1' color='gray'><DateMonthYear date={creation} /></Text>

                {handleScrollToMessage ? <Link size='1' className="invisible group-hover:visible cursor-pointer" onClick={() => handleScrollToMessage(message.name, channel_id, message.workspace)}>
                    View in channel
                </Link> : null}
            </Flex>

            <Flex gap='3'>
                <MessageSenderAvatar userID={owner} user={user} isActive={false} />
                <Flex direction='column' gap='0' justify='center'>
                    <Box>
                        <UserHoverCard user={user} userID={owner} isActive={false} />
                    </Box>
                    <MessageContent message={message} user={user} />
                </Flex>
            </Flex>
        </Flex>
    )
}