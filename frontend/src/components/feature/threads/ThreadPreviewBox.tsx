import { Box, Flex, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { NavLink, useParams } from 'react-router-dom'
import { ThreadMessage } from './Threads'
import { Message } from '../../../../../types/Messaging/Message'
import { ViewThreadParticipants } from './ThreadParticipants'
import { useMemo } from 'react'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'

export const ThreadPreviewBox = ({ thread }: { thread: ThreadMessage }) => {

    const user = useGetUser(thread.owner)
    const users = useGetUserRecords()
    const { channel } = useCurrentChannelData(thread.channel_id)
    const channelData = channel?.channelData
    const channelDetails = useMemo(() => {
        if (channelData) {
            if (channelData.is_direct_message) {
                const peer_user_name = users[(channelData as DMChannelListItem).peer_user_id]?.full_name ?? (channelData as DMChannelListItem).peer_user_id
                return {
                    channelIcon: '',
                    channelName: `DM with ${peer_user_name}`
                }
            } else {
                return {
                    channelIcon: channelData.type,
                    channelName: channelData.channel_name
                }
            }
        }
    }, [channelData, users])

    const { workspaceID } = useParams()

    return (
        <li>
            <NavLink to={`/${workspaceID}/threads/${thread.name}`}
                className={({ isActive }) => "group block hover:bg-gray-2 dark:hover:bg-gray-4 px-4 py-4 border-b border-gray-4" + (isActive ? " bg-gray-3 dark:bg-gray-4" : "")}>
                <Flex direction='column' gap='2'
                >
                    <Flex gap='2' align={'center'}>
                        <Flex gap='1' align={'center'} justify={'center'}>
                            {channelDetails?.channelIcon && <ChannelIcon type={channelDetails?.channelIcon as "Private" | "Public" | "Open"} size='14' />}
                            <Text as='span' size='1' className={'font-semibold'}>{channelDetails?.channelName}</Text>
                        </Flex>
                        <Text as='span' size='1' color='gray'><DateMonthYear date={thread.creation} /></Text>
                    </Flex>
                    <Flex gap='3'>
                        <MessageSenderAvatar userID={thread.owner} user={user} isActive={false} />
                        <Flex direction='column' gap='0.5' justify='center'>
                            <Box>
                                <UserHoverCard user={user} userID={thread.owner} isActive={false} />
                            </Box>
                            <MessageContent message={thread as unknown as Message} user={user} />
                        </Flex>
                    </Flex>
                    <Flex align={'center'} gap='2' className='pl-11'>
                        <ViewThreadParticipants participants={thread.participants ?? []} />
                        <Text as='div' size='1' className={'font-semibold text-accent-a11'}>{thread.reply_count ?? 0} {thread.reply_count && thread.reply_count === 1 ? 'Reply' : 'Replies'}</Text>
                    </Flex>
                </Flex>
            </NavLink>
        </li>
    )
}