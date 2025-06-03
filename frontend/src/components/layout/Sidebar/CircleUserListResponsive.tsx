import { useState } from 'react'
import { ContextMenu, Tooltip } from '@radix-ui/themes'
import { ChannelInfo } from '@/utils/users/CircleUserListProvider'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { FaUsers } from 'react-icons/fa6'
import { useSortable } from '@dnd-kit/sortable'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetUser } from '@/hooks/useGetUser'
import { useChannelActions } from '@/hooks/useChannelActions'

interface ResponsiveChannelGridProps {
  items: string[]
  enrichedSelectedChannels: ChannelInfo[]
  channelID: string
  isManuallyMarked: (id: string) => boolean
  isPinned: (id: string) => boolean
  markAsUnread: (channel: ChannelInfo) => void
  togglePin: (channel: ChannelInfo) => void
  setSelectedChannels: React.Dispatch<React.SetStateAction<string[]>>
}

const CircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const navigate = useNavigate()
  const isDM = channel.is_direct_message === 1
  const userInfo = useGetUser(channel?.peer_user_id ?? undefined)
  const displayName = isDM ? userInfo?.full_name : channel.channel_name
  const { clearManualMark } = useChannelActions()
  const { workspaceID } = useParams()

  const [dragging, setDragging] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0 || dragging) return // Chỉ điều hướng nếu là chuột trái và không đang kéo
    clearManualMark(channel.name)
    onActivate?.()
    navigate(`/${workspaceID}/${channel.name}`)
  }

  return (
    <Tooltip content={displayName} side='bottom'>
      <div
        className={clsx(
          'flex flex-col items-center space-y-1 cursor-pointer text-center p-1 rounded-md w-full',
          isActive ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        )}
        onMouseDown={() => setDragging(false)}
        onMouseMove={() => setDragging(true)}
        onMouseUp={handleClick}
      >
        <div className='flex flex-col items-center space-y-1'>
          <div className='relative w-10 h-10'>
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold leading-none',
                isDM
                  ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                  : 'border-2 border-teal-400 text-teal-600'
              )}
            >
              {isDM ? (
                <span>{displayName?.slice(0, 2).toUpperCase()}</span>
              ) : (
                <FaUsers className='text-teal-500 w-5 h-5' />
              )}
            </div>
            {channel.unread_count > 0 && (
              <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white'>
                {channel.unread_count > 9 ? '9+' : channel.unread_count}
              </div>
            )}
          </div>
          <div className='text-xs truncate max-w-full h-[16px] leading-[16px] text-center'>
            {displayName?.split(' ').slice(0, 1).join(' ')}
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

const SortableCircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: channel.name })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    minWidth: 70,
    minHeight: 80
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='w-full h-full'>
      <CircleUserItem channel={channel} isActive={isActive} onActivate={onActivate} />
    </div>
  )
}

export const CircleUserListResponsive = ({
  items,
  enrichedSelectedChannels,
  channelID,
  isManuallyMarked,
  isPinned,
  markAsUnread,
  togglePin,
  setSelectedChannels
}: ResponsiveChannelGridProps) => {
  const isMobile = useIsMobile()
  const [showExtraList, setShowExtraList] = useState(false)
  const itemsPerRow = 6

  const firstRowItems = isMobile ? items.slice(0, itemsPerRow) : items
  const restRowsItems = isMobile ? items.slice(itemsPerRow) : []
  const hasMoreRows = isMobile && restRowsItems.length > 0

  const visibleItems = isMobile
    ? [...firstRowItems, ...(showExtraList ? restRowsItems : [])]
    : items

  return (
    <>
      {hasMoreRows && (
        <button
          onClick={() => setShowExtraList((prev) => !prev)}
          className='ml-auto text-sm text-blue-600 dark:text-blue-400 underline mb-2'
        >
          {showExtraList ? 'Ẩn bớt' : 'Hiện thêm'}
        </button>
      )}

      <div className='flex flex-wrap gap-3 pl-0 pr-0 p-2 w-full overflow-hidden'>
        {visibleItems.map((channelName) => {
          const channel = enrichedSelectedChannels.find((c) => c.name === channelName)
          if (!channel) return null

          return (
            <ContextMenu.Root key={channel.name}>
              <ContextMenu.Trigger asChild>
                <div className={isMobile ? 'w-1/6' : 'w-[70px] h-[70px]'}>
                  <SortableCircleUserItem
                    channel={channel}
                    isActive={channel.name === channelID}
                    onActivate={() => {}}
                  />
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className='z-50 bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-md p-1'>
                  <ContextMenu.Item
                    className='px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer'
                    onClick={() => {
                      markAsUnread(channel)
                      setSelectedChannels((prev) => [...prev])
                    }}
                  >
                    {channel.unread_count > 0 || isManuallyMarked(channel.name)
                      ? 'Đánh dấu đã đọc'
                      : 'Đánh dấu chưa đọc'}
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className='px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer'
                    onClick={() => togglePin(channel)}
                  >
                    {isPinned(channel.name) ? 'Bỏ ghim khỏi danh sách' : 'Ghim lên đầu'}
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          )
        })}
      </div>
    </>
  )
}
