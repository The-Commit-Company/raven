import { UserAvatar } from '@/components/common/UserAvatar'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import { HStack } from '@/components/layout/Stack'
import { useGetUser } from '@/hooks/useGetUser'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { getTimePassed } from '@/utils/dateConversions'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { Box, Flex, Text } from '@radix-ui/themes'
import { FrappeConfig, FrappeContext, useFrappePostCall } from 'frappe-react-sdk'
import parse from 'html-react-parser'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BiHide, BiMessageAltDetail } from 'react-icons/bi'
import { LuAtSign } from 'react-icons/lu'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useSWRInfinite from 'swr/infinite'

interface MentionObject {
  name: string
  mention_id: string
  channel_id: string
  channel_type: RavenChannel['type']
  channel_name: string
  workspace?: string
  is_thread: 0 | 1
  is_direct_message: 0 | 1
  is_read: 0 | 1
  creation: string
  message_type: RavenMessage['message_type']
  owner: string
  text: string
}

const PAGE_SIZE = 10

const MentionsList: React.FC = () => {
  const { call } = useContext(FrappeContext) as FrappeConfig
  const { workspaceID } = useParams<{ workspaceID: string }>()
  const [hiddenMentionIds, setHiddenMentionIds] = React.useState<Set<string>>(new Set())
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const messageParams = searchParams.get('message_id')

  const getKey = useCallback((pageIndex: number, prev: { message: MentionObject[] } | null) => {
    if (prev && !prev.message?.length) return null
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

  const isEmpty = pages[0]?.message?.length === 0
  const isLoadingMore = isLoading || (size > 0 && !pages[size - 1])
  const isReachingEnd = isEmpty || (pages[size - 1]?.message?.length ?? 0) < PAGE_SIZE

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

  const handleHideMention = useCallback((id: string) => {
    setHiddenMentionIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  if (isEmpty) {
    return (
      <Flex direction='column' align='center' justify='center' className='h-[320px] px-6 text-center'>
        <LuAtSign size={48} className='text-gray-8 mb-4' />
        <Text size='5' weight='medium' className='mb-2'>
          Chưa có lượt nhắc nào
        </Text>
        <Text size='2' color='gray'>
          Khi ai đó đề cập đến bạn trong cuộc trò chuyện, nội dung sẽ hiển thị ở đây.
        </Text>
      </Flex>
    )
  }

  return (
    <ul role='list' className='list-none h-full overflow-y-auto scrollbar-hide'>
      {mentions
        ?.filter((m) => !hiddenMentionIds.has(m.name))
        .map((mention) => (
          <li key={mention.name} className='border-b border-gray-4 last:border-0'>
            <MentionItem
              mention={mention}
              workspaceID={workspaceID}
              onHide={handleHideMention}
              messageParams={messageParams}
            />
          </li>
        ))}

      <div ref={observerRef} className='h-4'>
        {isReachingEnd ? (
          <div className='p-4 text-center'>
            <Text size='2' color='gray'>
              Bạn đã xem hết tất cả lượt nhắc.
            </Text>
          </div>
        ) : isLoadingMore ? (
          <div className='p-4'>
            <BeatLoader text='Đang tải thêm lượt nhắc...' />
          </div>
        ) : null}
      </div>
    </ul>
  )
}

export default MentionsList

const MentionItem: React.FC<{
  mention: MentionObject
  messageParams?: string | null
  workspaceID?: string
  onHide: (id: string) => void
}> = ({ mention, workspaceID, onHide, messageParams }) => {
  const [isRead, setIsRead] = useState(mention.is_read === 1)

  const { call, loading: isLoading } = useFrappePostCall('raven.api.mentions.toggle_mention_hidden')

  const { call: markAsRead } = useFrappePostCall('raven.api.mentions.mark_mention_as_read')

  const navigate = useNavigate()

  const to = useMemo(() => {
    const w = mention.workspace ?? workspaceID
    if (mention.is_thread) {
      return { pathname: `/${w}/threads/${mention.channel_id}` }
    }
    return { pathname: `/${w}/${mention.channel_id}`, search: `message_id=${mention.name}` }
  }, [mention, workspaceID])

  const handleClickHide = () => {
    call({ mention_id: mention.mention_id })
      .then(() => {
        onHide(mention.name)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const handleClickMention = () => {
    if (!isRead) {
      markAsRead({ mention_id: mention.mention_id }).catch(() => {
        console.warn('Mark as read failed')
      })
      setIsRead(true)
    }

    navigate(to)
  }

  return (
    <div className='relative group'>
      <Box
        onClick={handleClickMention}
        className={`block py-3 px-4 pr-8 hover:bg-gray-2 dark:hover:bg-gray-4 cursor-pointer ${mention.name === messageParams ? 'bg-gray-100 dark:bg-gray-800/80' : ''}`}
      >
        <ChannelContext mention={mention} />

        {!isRead && <span className='absolute top-3.5 right-2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md' />}
      </Box>

      <button
        onClick={handleClickHide}
        disabled={isLoading}
        title='Ẩn lượt nhắc này'
        className='absolute right-1 bottom-1 opacity-0 group-hover:opacity-100
               bg-gray-3 dark:bg-gray-6 hover:bg-red-4 dark:hover:bg-red-6
               text-gray-12 dark:text-gray-2 p-1 rounded-full transition-all duration-200
               shadow-sm hover:shadow-md cursor-pointer'
      >
        <BiHide size={14} />
      </button>
    </div>
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
              <ChannelIcon type={mention.channel_type} size={14} />
              <Text size='1' weight='medium'>
                {mention.channel_name.length > 10 ? `${mention.channel_name.slice(0, 10)}...` : mention.channel_name}
              </Text>
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
