import React, { useContext, useMemo, useCallback, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import useSWRInfinite from 'swr/infinite'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { Box, Text, Flex } from '@radix-ui/themes'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { UserAvatar } from '@/components/common/UserAvatar'
import { BiMessageAltDetail } from 'react-icons/bi'
import { LuAtSign } from 'react-icons/lu'
import parse from 'html-react-parser'
import { getTimePassed } from '@/utils/dateConversions'
import { HStack } from '@/components/layout/Stack'
import { useGetUser } from '@/hooks/useGetUser'

interface MentionObject {
  name: string
  channel_id: string
  channel_type: RavenChannel['type']
  channel_name: string
  workspace?: string
  is_thread: 0 | 1
  is_direct_message: 0 | 1
  creation: string
  message_type: RavenMessage['message_type']
  owner: string
  text: string
}

const PAGE_SIZE = 10

const MentionsList: React.FC = () => {
  const { call } = useContext(FrappeContext) as FrappeConfig
  const { workspaceID } = useParams<{ workspaceID: string }>()

  const getKey = useCallback((pageIndex: number, prev: { message: MentionObject[] } | null) => {
    if (prev && !prev.message.length) return null
    return ['raven.api.mentions.get_mentions', { limit: PAGE_SIZE, start: pageIndex * PAGE_SIZE }] as const
  }, [])

  const fetcher = useCallback(
    (args: any) => {
      const [endpoint, params] = args
      return call.post(endpoint, params)
    },
    [call]
  )

  const { data, size, isLoading, setSize } = useSWRInfinite(getKey, fetcher, { revalidateOnFocus: false })

  const pages = data ?? []
  const mentions = useMemo(() => pages.flatMap((page) => page.message), [pages])

  const isEmpty = pages[0]?.message.length === 0
  const isLoadingMore = isLoading || (size > 0 && !pages[size - 1])
  const isReachingEnd = isEmpty || (pages[size - 1]?.message.length ?? 0) < PAGE_SIZE

  const observerRef = useRef<HTMLDivElement>(null)
  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isLoadingMore) setSize(size + 1)
  }, [isReachingEnd, isLoadingMore, setSize, size])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )
    if (observerRef.current) obs.observe(observerRef.current)
    return () => obs.disconnect()
  }, [loadMore])

  if (isEmpty) {
    return (
      <Flex direction='column' align='center' justify='center' className='h-[320px] px-6 text-center'>
        <LuAtSign size={48} className='text-gray-8 mb-4' />
        <Text size='5' weight='medium' className='mb-2'>
          No mentions yet
        </Text>
        <Text size='2' color='gray'>
          When someone mentions you in a message, you'll see it here.
        </Text>
      </Flex>
    )
  }

  return (
    <ul role='list' className='list-none h-[380px] overflow-y-auto'>
      {mentions.map((mention) => (
        <li key={mention.name} className='border-b border-gray-4 last:border-0'>
          <MentionItem mention={mention} workspaceID={workspaceID} />
        </li>
      ))}

      <div ref={observerRef} className='h-4'>
        {isReachingEnd ? (
          <div className='p-4 text-center'>
            <Text size='2' color='gray'>
              You've reached the end of your mentions.
            </Text>
          </div>
        ) : isLoadingMore ? (
          <div className='p-4'>
            <BeatLoader text='Loading more mentions...' />
          </div>
        ) : null}
      </div>
    </ul>
  )
}

export default MentionsList

const MentionItem: React.FC<{ mention: MentionObject; workspaceID?: string }> = ({ mention, workspaceID }) => {
  const to = useMemo(() => {
    const w = mention.workspace ?? workspaceID
    if (mention.is_thread) {
      return { pathname: `/${w}/threads/${mention.channel_id}` }
    }
    return { pathname: `/${w}/${mention.channel_id}`, search: `message_id=${mention.name}` }
  }, [mention, workspaceID])

  return (
    <Link to={to} className='block py-3 px-4 hover:bg-gray-2 dark:hover:bg-gray-4'>
      <ChannelContext mention={mention} />
    </Link>
  )
}

const ChannelContext: React.FC<{ mention: MentionObject }> = ({ mention }) => {
  const user = useGetUser(mention.owner)
  const senderName = user?.full_name ?? mention.owner

  return (
    <HStack gap='2' align='start' className='w-full'>
      <UserAvatar src={user?.user_image} alt={senderName} size='2' className='mt-0.5' />
      <Box className='w-full'>
        <HStack className='w-full justify-between'>
          <Text size='2' weight='medium'>
            {senderName}
          </Text>
          {mention.is_thread ? (
            <HStack className='ml-auto' gap='1' align='center'>
              <BiMessageAltDetail size={14} />
            </HStack>
          ) : mention.is_direct_message ? null : (
            <HStack className='ml-auto' gap='0.5' align='center'>
              <ChannelIcon type={mention.channel_type} size={14} /> {mention.channel_name}
            </HStack>
          )}
        </HStack>
        <Box className='mt-0.5'>
          <MessageContent content={mention.text} />
        </Box>
        <TimeStamp creation={mention.creation} />
      </Box>
    </HStack>
  )
}

const MessageContent: React.FC<{ content: string }> = ({ content }) => (
  <Text as='p' className='text-sm line-clamp-2 text-ellipsis'>
    <span className='[&_.mention]:text-accent-11'>{parse(content)}</span>
  </Text>
)

const TimeStamp: React.FC<{ creation: string }> = ({ creation }) => (
  <Text size='1' className='text-gray-11 shrink-0'>
    {getTimePassed(creation)}
  </Text>
)
