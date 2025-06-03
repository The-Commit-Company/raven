import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { useFrappeCreateDoc, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useParams } from 'react-router-dom'
interface JoinChannelBoxProps {
  channelData?: ChannelListItem
  user: string
}

export const JoinChannelBox = ({ channelData, user }: JoinChannelBoxProps) => {
  const { mutate } = useSWRConfig()
  const { threadID } = useParams()
  const { call: trackingCall } = useFrappePostCall('raven.api.raven_channel_member.track_seen')
  const { createDoc, error, loading } = useFrappeCreateDoc()

  const joinChannel = async () => {
    const channel_id = channelData?.name ?? threadID
    try {
      await createDoc('Raven Channel Member', {
        channel_id,
        user_id: user
      })
      await trackingCall({ channel_id })
      mutate(['channel_members', channel_id])
    } catch (error) {
      console.error('Lỗi khi tham gia kênh:', error)
    }
  }

  return (
    <Box>
      <Flex
        direction='column'
        align='center'
        gap={channelData ? '3' : '2'}
        className='border border-gray-6 rounded-md bg-surface animate-fadein sm:mb-0 mb-2'
        p={channelData ? '4' : '3'}
      >
        <ErrorBanner error={error} />
        <Text as='span' size={'2'}>
          Bạn không phải là thành viên của {channelData ? 'kênh' : 'chủ đề'} này.
        </Text>
        <Button onClick={joinChannel} size={channelData ? '2' : '1'} disabled={loading}>
          {loading && <Loader className='text-white' />}
          {loading ? (
            'Đang tham gia'
          ) : (
            <span className='inline-flex gap-1 not-cal font-medium'>
              Tham gia {channelData ? `${channelData?.channel_name}` : 'cuộc trò chuyện'}
            </span>
          )}
        </Button>
      </Flex>
    </Box>
  )
}
