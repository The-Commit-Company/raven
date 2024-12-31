import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { Link, useParams } from 'react-router-dom'
import { ThreadMessage } from './Threads'
import { Message } from '../../../../../types/Messaging/Message'
import { ViewThreadParticipants } from './ThreadParticipants'
import { useMemo } from 'react'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { ThreadReplyCount } from '../chat/ChatMessage/Renderers/ThreadMessage'

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

    const workspace = thread.workspace ? thread.workspace : workspaceID

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            px-3
            py-2
            border border-gray-4
            rounded-md">
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
                <ThreadReplyCount thread={thread as unknown as Message} />
                <Button size={'1'}
                    asChild
                    color="gray"
                    variant={'ghost'}
                    className={'not-cal w-fit hover:bg-transparent hover:underline cursor-pointer'}>
                    <Link to={`/${workspace}/${thread.channel_id}/thread/${thread.name}`}>View Thread</Link>
                </Button>
            </Flex>
        </Flex>
    )
}