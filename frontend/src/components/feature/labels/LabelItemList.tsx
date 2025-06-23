import { useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Flex, Text, ContextMenu, Dialog, Button } from '@radix-ui/themes'
import clsx from 'clsx'
import { FaUsers } from 'react-icons/fa6'

import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { UserContext } from '@/utils/auth/UserProvider'
import { replaceCurrentUserFromDMChannelName } from '@/utils/operations'
import { useRemoveChannelFromLabel } from '@/hooks/useRemoveChannelFromLabel'
import { toast } from 'sonner'
import { useUpdateChannelLabels } from '@/utils/channel/ChannelAtom'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useSWRConfig } from 'frappe-react-sdk'
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery'
import { truncateText } from '@/utils/textUtils/truncateText'
import { useSetAtom } from 'jotai'
import { refreshLabelListAtom } from './conversations/atoms/labelAtom'

type Props = {
  channelID: string
  channelName: string
  labelID: string
  isDirectMessage: boolean
  unreadCount?: number
  onRemoveLocally?: (channelID: string) => void
}

const LabelItemList = ({
  channelID,
  channelName,
  labelID,
  isDirectMessage,
  unreadCount = 0,
  onRemoveLocally
}: Props) => {
  const [showModal, setShowModal] = useState(false)
  const { currentUser } = useContext(UserContext)
  const { workspaceID, channelID: channelIDParams } = useParams()
  const isDM = isDirectMessage === true

  const { mutate } = useSWRConfig()

  const peer_user_id = isDM ? replaceCurrentUserFromDMChannelName(channelName, currentUser) : ''
  const user = useGetUser(peer_user_id)
  const navigate = useNavigate()

  const displayName = isDM ? user?.full_name : channelName
  const isActive = channelIDParams === channelID

  const setRefreshKey = useSetAtom(refreshLabelListAtom)

  const { removeChannel, loading: isLoading } = useRemoveChannelFromLabel()
  const { updateChannelLabels } = useUpdateChannelLabels()
  const { clearManualMark } = useChannelActions()

  const handleClick = () => {
    clearManualMark(channelID)
    if (workspaceID) {
      navigate(`/${workspaceID}/${channelID}`)
    } else {
      navigate(`/channel/${channelID}`)
    }
  }

  const handleRemove = async () => {
    try {
      await removeChannel(labelID, channelID)
      onRemoveLocally?.(channelID)
      updateChannelLabels(channelID, (prevLabels) => prevLabels.filter((l) => l.label_id !== labelID))
      setRefreshKey((prev) => prev + 1)

      toast.success(`Đã xóa thành công`)
      setShowModal(false)
      mutate('channel_list')
    } catch (err) {
      console.error('Xoá thất bại:', err)
      toast.error('Xoá channel khỏi nhãn thất bại')
    }
  }

  const isTablet = useIsTablet()
  const isMobile = useIsMobile()
  const maxLength = isTablet || isMobile ? 20 : 30

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Box
          as='div'
          onClick={handleClick}
          className={clsx(
            'py-1.5 px-2.5 group relative cursor-pointer flex items-center space-x-2 touch-manipulation select-none',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            isActive && 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          <Flex gap='2' align='center' justify='between' width='100%'>
            <Flex gap='2' align='center'>
              {isDM ? (
                <UserAvatar src={user?.user_image} alt={displayName} isBot={user?.type === 'Bot'} />
              ) : (
                <div className='rounded-full w-5 h-5 border-2 border-teal-400 text-teal-600 flex items-center justify-center'>
                  <FaUsers className='w-4 h-4' />
                </div>
              )}
              <Text as='span' className={clsx('line-clamp-1 text-ellipsis', 'text-base md:text-sm xs:text-xs')}>
                {truncateText(displayName || '', maxLength)}
              </Text>
            </Flex>
            {unreadCount > 0 && (
              <div className='bg-red-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </Flex>
        </Box>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Item
          onSelect={() => setShowModal(true)}
          className='cursor-pointer hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors text-red-500 dark:text-red-500'
        >
          Xoá khỏi nhãn này
        </ContextMenu.Item>
      </ContextMenu.Content>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content className='max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg z-[300]'>
          <Dialog.Title>Xác nhận xoá</Dialog.Title>
          <Text as='p' size='3' className='mb-4'>
            Bạn có chắc muốn xoá kênh <strong>{displayName}</strong> khỏi nhãn này không?
          </Text>
          <Flex justify='end' gap='3'>
            <Button className='cursor-pointer' variant='soft' onClick={() => setShowModal(false)}>
              Huỷ
            </Button>
            <Button className='cursor-pointer' color='red' onClick={handleRemove} disabled={isLoading}>
              {isLoading ? 'Đang xoá...' : 'Xoá'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </ContextMenu.Root>
  )
}

export default LabelItemList
