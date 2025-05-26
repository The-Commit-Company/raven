import { useEffect, useState } from 'react'
import { useUnreadMessages } from '@/utils/layout/sidebar'
import { ChannelInfo, useCircleUserList } from '@/utils/users/CircleUserListProvider'
import { useMergedUnreadCount } from '@/components/feature/direct-messages/DirectMessageListCustom'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetUser } from '@/hooks/useGetUser'
import * as ContextMenu from '@radix-ui/react-context-menu'
import clsx from 'clsx'
import { FaUsers } from 'react-icons/fa6'
import { useChannelActions } from '@/hooks/useChannelActions'
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { Tooltip } from '@radix-ui/themes'
import { SidebarBodyProps } from './SidebarBodyCustom'

interface Props {
  channel: ChannelInfo
  isActive?: boolean
  onActivate?: () => void
}

const LOCAL_STORAGE_KEY = 'raven_selected_channels'
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const SortableCircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: channel.name })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ContextMenu.Trigger asChild>
        <div
          onPointerDown={(e) => {
            if (e.button === 0) {
              listeners?.onPointerDown?.(e)
            }
          }}
        >
          <CircleUserItem channel={channel} isActive={isActive} onActivate={onActivate} />
        </div>
      </ContextMenu.Trigger>
    </div>
  )
}

const CircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const navigate = useNavigate()
  const isDM = channel.is_direct_message === 1
  const userInfo = useGetUser(channel?.peer_user_id ?? undefined)
  const displayName = isDM ? userInfo?.full_name : channel.channel_name
  const { clearManualMark } = useChannelActions()
  const { channelID } = useParams()

  const handleClick = () => {
    clearManualMark(channel.name)
    onActivate?.()
    navigate(`/channel/${channel.name}`)
  }

  useEffect(() => {
    if (channelID === channel.name) {
      clearManualMark(channel.name)
    }
  }, [channelID])

  return (
    <Tooltip content={displayName} side='bottom'>
      <div
        onClick={handleClick}
        className={clsx(
          'flex flex-col items-center space-y-1 cursor-pointer text-center',
          'p-1 rounded-md w-full',
          isActive ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        )}
      >
        <div className='flex flex-col items-center space-y-1'>
          <div className='relative w-10 h-10'>
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold leading-none',
                isDM
                  ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                  : 'border-2 border-teal-400 text-teal-600',
                isActive
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
            {displayName?.split(' ').slice(0, 2).join(' ')}
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

const CircleUserList = ({ size }: SidebarBodyProps) => {
  const { selectedChannels, setSelectedChannels } = useCircleUserList()
  const unread_count = useUnreadMessages()
  const { isPinned, togglePin, markAsUnread, isManuallyMarked } = useChannelActions()
  const channelID = useParams().channelID || ''
  const safeSelectedChannels = selectedChannels.map((c) => ({
    ...c,
    last_message_timestamp: c.last_message_timestamp ?? undefined // chuyển null -> undefined
  }))

  const enrichedSelectedChannels = useMergedUnreadCount(safeSelectedChannels, unread_count?.message ?? [])
  const [items, setItems] = useState(enrichedSelectedChannels.map((c) => c.name))

  useEffect(() => {
    const newItems = enrichedSelectedChannels.map((c) => c.name)
    const isEqual = newItems.length === items.length && newItems.every((v, i) => v === items[i])
    if (!isEqual) {
      setItems(newItems)
    }
  }, [enrichedSelectedChannels])

  const getGridCols = (size: number): number => {
    if (size <= 10) return 2
    if (size <= 20) return 4
    if (size <= 30) return 5
    if (size <= 40) return 6
    return 6
  }

  const gridCols = getGridCols(size)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.indexOf(active.id)
    const newIndex = items.indexOf(over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    const reordered = newItems
      .map((name) => enrichedSelectedChannels.find((c) => c.name === name))
      .filter(Boolean) as ChannelInfo[]

    setSelectedChannels(reordered)

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reordered))
    }, 1000)
  }

  return enrichedSelectedChannels?.length > 0 ? (
    <div className='w-full'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div
            className={`grid grid-cols-${gridCols} gap-3 p-2 overflow-hidden ${gridCols >= 5 ? 'mx-auto max-w-4xl' : ''}`}
          >
            {items.map((channelName) => {
              const channel = enrichedSelectedChannels.find((c) => c.name === channelName)
              if (!channel) return null

              return (
                <div key={channel.name} className='flex flex-col items-center justify-center w-fit'>
                  <ContextMenu.Root>
                    <SortableCircleUserItem
                      channel={channel}
                      isActive={channel.name === channelID}
                      onActivate={() => {}}
                    />
                    <ContextMenu.Portal>
                      <ContextMenu.Content className='z-50 bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-md p-1'>
                        <ContextMenu.Item
                          className='px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer'
                          onClick={() => markAsUnread(channel)}
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
                </div>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  ) : null
}

export default CircleUserList
