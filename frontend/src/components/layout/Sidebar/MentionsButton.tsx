import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { __ } from '@/utils/translations'
import { Box, IconButton, Popover, Text, Flex } from '@radix-ui/themes'
import { FrappeConfig, FrappeContext, useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { LuAtSign } from 'react-icons/lu'
import parse from 'html-react-parser'
import { getTimePassed } from '@/utils/dateConversions'
import { HStack } from '../Stack'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useGetUser } from '@/hooks/useGetUser'
import { UserAvatar } from '@/components/common/UserAvatar'
import { BiMessageAltDetail } from 'react-icons/bi'
import { useMemo, useCallback, useEffect, useRef, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import useSWRInfinite from 'swr/infinite'

const MentionsButton = () => {

    const { data: mentionsCount, mutate } = useFrappeGetCall<{ message: number }>('raven.api.mentions.get_unread_mention_count', undefined, undefined, {
        revalidateOnFocus: true,
        focusThrottleInterval: 1000 * 60 * 5,
    })

    useFrappeEventListener('raven_mention', () => {
        mutate()
    })

    const onClose = (open: boolean) => {
        if (!open) {
            mutate({ message: 0 }, { revalidate: false })
        }
    }

    return (
        <Popover.Root onOpenChange={onClose}>
            <Popover.Trigger>
                <IconButton
                    size={{ initial: '2', md: '2' }}
                    aria-label='View mentions'
                    title={__("View mentions")}
                    color='gray'
                    variant='ghost'
                    className='relative text-gray-11 sm:hover:text-gray-12 sm:hover:bg-transparent p-2 sm:px-4 data-[state=open]:bg-transparent data-[state=open]:text-gray-12'
                >
                    <LuAtSign className='text-lg sm:text-xl' />
                    {mentionsCount && mentionsCount?.message > 0 && <Box className='rounded-full absolute -right-0.5 -bottom-0.5 sm:right-1.5 sm:bottom-0 bg-red-11 dark:bg-red-9 text-white w-4 h-4 flex items-center justify-center'>
                        <Text as='span' size='1'>{mentionsCount?.message}</Text>
                    </Box>}
                </IconButton>
            </Popover.Trigger>
            <Popover.Content width={{ initial: '360px', md: '480px' }} className="p-0">
                <MentionsList />
            </Popover.Content>
        </Popover.Root>
    )
}

interface MentionObject {
    /** ID of the message */
    name: string
    /** ID of the channel */
    channel_id: string
    /** Type of the channel */
    channel_type: RavenChannel['type']
    /** Name of the channel */
    channel_name: string
    /** Workspace name */
    workspace?: string
    /** Whether the channel is a thread */
    is_thread: 0 | 1
    /** Whether the channel is a direct message */
    is_direct_message: 0 | 1
    /** Date and time of the message */
    creation: string
    /** Type of the message */
    message_type: RavenMessage['message_type']
    /** Owner of the message */
    owner: string
    /** Text of the message */
    text: string
}

const PAGE_SIZE = 10

const MentionsList = () => {

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize } = useSWRInfinite<{ message: MentionObject[] }>(
        (pageIndex: number, previousPageData: { message: MentionObject[] } | null) => {
            if (previousPageData && !previousPageData.message.length) return null
            const start = pageIndex * PAGE_SIZE
            return ['raven.api.mentions.get_mentions', {
                limit: PAGE_SIZE,
                start
            }] as const
        },
        ([endpoint, params]: readonly [string, { limit: number; start: number }]) => call.post(endpoint, params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: true,
            revalidateOnMount: true
        }
    )

    const isEmpty = data?.[0]?.message?.length === 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)
    const mentions = data?.flatMap((page: { message: MentionObject[] }) => page.message) ?? []

    const observerTarget = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize(size + 1)
        }
    }, [isReachingEnd, isLoadingMore, setSize, size])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [loadMore])

    if (isEmpty) {
        return (
            <Flex
                direction='column'
                align='center'
                justify='center'
                className='h-[320px] px-6 text-center'
            >
                <div className='text-gray-8 mb-4'>
                    <LuAtSign size={48} />
                </div>
                <Text size='5' weight='medium' className='mb-2'>
                    No mentions yet
                </Text>
                <Text as='p' size='2' color='gray' className='sm:max-w-[400px] max-w-[320px]'>
                    When someone mentions you in a message, you'll see it here.
                </Text>
            </Flex>
        )
    }

    return (
        <ul role='list' className='list-none h-[380px] overflow-y-auto'>
            {mentions.map((mention) => (
                <li key={mention.name} role='listitem' className='border-b border-gray-4 last:border-0'>
                    <MentionItem mention={mention} />
                </li>
            ))}
            <div ref={observerTarget} className="h-4">
                {isReachingEnd && <div className='p-4'>
                    <Text as='span' size='2' color='gray' className='sm:max-w-[400px] max-w-[320px] text-center'>
                        You've reached the end of your mentions.
                    </Text>
                </div>}
            </div>
            {isLoadingMore && <div className="p-4"><BeatLoader text='Loading more mentions...' /></div>}

        </ul>
    )
}

const MentionItem = ({ mention }: { mention: MentionObject }) => {
    const { workspaceID } = useParams()

    const to = useMemo(() => {
        const w = mention.workspace ? mention.workspace : workspaceID
        if (mention.is_thread) {
            return { path: `/${w}/threads/${mention.channel_id}`, search: undefined }
        }
        return { path: `/${w}/${mention.channel_id}`, search: `message_id=${mention.name}` }
    }, [mention, workspaceID])

    return (
        <Popover.Close>
            <Link
                to={{
                    pathname: to.path,
                    search: to.search
                }}
                className="block py-3 px-4 hover:bg-gray-2 dark:hover:bg-gray-4 text-left"
            >
                <ChannelContext mention={mention} />
            </Link>
        </Popover.Close>
    )
}

const ChannelContext = ({ mention }: { mention: MentionObject }) => {
    const user = useGetUser(mention.owner)
    const senderName = user?.full_name ?? mention.owner

    return (
        <HStack gap="2" align="start" className='w-full'>
            <UserAvatar src={user?.user_image} alt={senderName} size="2" className='mt-0.5' />
            <Box className='w-full'>
                <HStack className='w-full justify-between'>
                    <HStack gap="1" align="center" className='w-full'>
                        <Text size="2" weight="medium">{senderName}</Text>
                        <Text size="1" as="span">
                            {mention.is_thread ? (
                                <HStack gap="1" align="center" className="inline-flex">
                                    in <BiMessageAltDetail size="14" className="mt-[0.5px]" /> thread

                                </HStack>
                            ) : mention.is_direct_message ? (
                                null
                            ) : (
                                <>
                                    <HStack align="center" className="inline-flex gap-0.5">
                                        in  <ChannelIcon type={mention.channel_type} size="14" className="mt-[0.5px]" /> {mention.channel_name}
                                    </HStack>
                                </>
                            )}
                        </Text>
                    </HStack>
                    <TimeStamp creation={mention.creation} />
                </HStack>
                <Box className="mt-0.5">
                    <MessageContent content={mention.text} />
                </Box>
            </Box>
        </HStack>
    )
}

const MessageContent = ({ content }: { content: string }) => {
    return (
        <Text as='p' className="text-sm line-clamp-2 text-ellipsis sm:w-[320px] w-[200px]">
            <div className="[&_.mention]:text-accent-11 [&_p]:my-0">
                {typeof content === 'string' ? parse(content) : content}
            </div>
        </Text>
    )
}

const TimeStamp = ({ creation }: { creation: string }) => {
    return (
        <Text as="span" size="1" className="text-gray-11 shrink-0">{getTimePassed(creation)}</Text>
    )
}

export default MentionsButton