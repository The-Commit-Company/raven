import { Badge, Box, Flex, Text } from '@radix-ui/themes'
import { getTimePassed, DateMonthYear } from '@/utils/dateConversions'
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
import clsx from 'clsx'
// import { UserAvatar } from '@/components/common/UserAvatar'
// import parse from 'html-react-parser';
// import { HStack } from '@/components/layout/Stack'
// import { BiFile, BiImage, BiPoll } from 'react-icons/bi'
// import { LuListTree } from 'react-icons/lu'

// interface LastMessageDetails {
//     content: string;
//     owner: string;
//     is_bot_message: 0 | 1;
//     bot?: string;
//     message_type: 'Text' | 'File' | 'Image' | 'Poll' | 'System';
// }

// const parseLastMessageDetails = (lastMessageDetails: string): LastMessageDetails | null => {
//     try {
//         const parsed = JSON.parse(lastMessageDetails)
//         // Validate required fields
//         if (typeof parsed.owner === 'string' &&
//             (parsed.is_bot_message === 0 || parsed.is_bot_message === 1) &&
//             typeof parsed.message_type === 'string') {
//             return parsed as LastMessageDetails
//         }
//         return null
//     } catch (e) {
//         return null
//     }
// }

// const LastMessagePreview = ({ details, timestamp, isActive }: { details: LastMessageDetails, timestamp: string, isActive: boolean }) => {
//     const user = useGetUser(details.owner)

//     const plainTextContent = useMemo(() => {
//         if (details.content) {
//             // Create a temporary div to parse HTML and get plain text
//             const temp = document.createElement('div')
//             temp.innerHTML = details.content
//             return temp.textContent || temp.innerText || ''
//         }
//         return ''
//     }, [details.content])

//     return (
//         <Box className='pl-9 mt-2'>
//             <Flex gap='2'>
//                 <div className='mt-1 text-gray-9'>
//                     <LuListTree size='18' />
//                 </div>
//                 <Box className={clsx('flex-1 rounded-md border py-2 px-2.5 dark:shadow-lg',
//                     isActive
//                         ? 'bg-gray-3 dark:bg-gray-4 border-gray-5 dark:border-gray-6' // Selected state
//                         : 'bg-gray-2 dark:bg-gray-3 border-gray-3 dark:border-gray-5 group-hover:border-gray-4 group-hover:bg-gray-3/70 dark:group-hover:bg-gray-4/70' // Normal & hover state
//                 )}>
//                     <Flex gap='2' align='start'>
//                         <div className='mt-0.5'>
//                             <UserAvatar src={user?.user_image} alt={user?.full_name} size='2' isBot={user?.type === 'Bot'} />
//                         </div>
//                         <Flex direction='column' className='gap-0.5' justify='center'>
//                             <Text className='text-sm' weight='medium'>{user?.full_name ?? details.owner}
//                                 {timestamp && <Text as='span' className='ml-1.5 font-light text-xs'>{getTimePassed(timestamp)}</Text>}
//                             </Text>
//                             <HStack align='center' gap='1'>
//                                 {details.message_type === 'File' && <BiFile size='16' />}
//                                 {details.message_type === 'Image' && <BiImage size='16' />}
//                                 {details.message_type === 'Poll' && <BiPoll size='16' />}
//                                 {details.content &&
//                                     <Text size='2' className='line-clamp-2' title={plainTextContent}>
//                                         {parse(details.content)}
//                                     </Text>
//                                 }
//                             </HStack>
//                         </Flex>
//                     </Flex>
//                 </Box>
//             </Flex>
//         </Box>
//     )
// }

export const ThreadPreviewBox = ({ thread, unreadCount }: { thread: ThreadMessage, unreadCount: number }) => {

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

    // const lastMessageDetails = useMemo(() => {
    //     if (thread.last_message_details) {
    //         return parseLastMessageDetails(thread.last_message_details)
    //     }
    //     return null
    // }, [thread.last_message_details])

    return (
        <NavLink
            to={`/${workspaceID}/threads/${thread.name}`}
            tabIndex={0}
            className={({ isActive }) => clsx(
                "group block hover:bg-gray-2 dark:hover:bg-gray-4 px-4 py-4 border-b border-gray-4 overflow-hidden",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-inset",
                isActive && "bg-gray-3 dark:bg-gray-3"
            )}>
            {({ isActive }) => (
                <div className='flex w-full justify-between items-center gap-2'>
                    <Flex direction='column' gap='2'>
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
                                <MessageContent message={thread as unknown as Message} user={user} forceHideLinkPreview />
                            </Flex>
                        </Flex>
                        <Flex align={'center'} gap='2' className='pl-11'>
                            <ViewThreadParticipants participants={thread.participants ?? []} />
                            <Text as='div' size='1' className={'font-medium text-accent-a11'}>{thread.reply_count ?? 0} {thread.reply_count && thread.reply_count === 1 ? 'Reply' : 'Replies'}</Text>
                        </Flex>
                        {/* {lastMessageDetails && <LastMessagePreview
                            details={lastMessageDetails}
                            timestamp={thread.last_message_timestamp}
                            isActive={isActive}
                        />} */}
                    </Flex>
                    {unreadCount > 0 && <Badge variant='soft' className='font-bold' size='2'>{unreadCount}</Badge>}
                </div>
            )}
        </NavLink>
    )
}