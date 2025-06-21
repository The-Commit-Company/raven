import { useChannelActions } from '@/hooks/useChannelActions'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { ChannelWithGroupType, sortedChannelsAtom } from '@/utils/channel/ChannelAtom'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'

interface Props {
  channel: ChannelWithGroupType
  isActive?: boolean
  onActivate?: () => void
}

const LOCAL_STORAGE_KEY = 'raven_selected_channels'
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const SortableCircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: channel.name })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    minWidth: 50,
    minHeight: 50
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CircleUserItem channel={channel} isActive={isActive} onActivate={onActivate} />
    </div>
  )
}

const CircleUserItem = ({ channel, isActive, onActivate }: Props) => {
  const navigate = useNavigate()
  const isDM = channel.is_direct_message === 1
  const userInfo = useGetUser(channel?.peer_user_id ?? undefined)
  const displayName = isDM ? userInfo?.full_name : channel.channel_name
  const { clearManualMark } = useChannelActions()
  const { workspaceID } = useParams()
  const isMobile = useIsMobile()

  const [dragging, setDragging] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0 || dragging) return
    clearManualMark(channel.name)
    onActivate?.()
    navigate(`/${workspaceID}/${channel.name}`)
  }

  const shortName = useMemo(() => {
    const firstWord = displayName?.split(' ')[0] || ''
    return firstWord?.length > 6 ? firstWord.slice(0, 6) + '...' : firstWord
  }, [displayName, isMobile])

  return (
    <Tooltip content={displayName} side='bottom'>
      <div
        className={clsx(
          'flex flex-col items-center space-y-1 cursor-pointer text-center p-1 rounded-md w-full',
          isActive ? 'bg-gray-300 dark:bg-gray-700' : !isMobile && 'hover:bg-gray-200 dark:hover:bg-gray-600'
        )}
        onMouseDown={() => setDragging(false)}
        onMouseMove={() => setDragging(true)}
        onMouseUp={handleClick}
      >
        <div className='flex flex-col items-center space-y-1'>
          <div className='relative'>
            <div
              className={clsx(
                'rounded-full flex items-center justify-center',
                isDM
                  ? 'w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                  : 'border-2 border-teal-400 text-teal-600 w-7 h-7'
              )}
            >
              {isDM ? (
                <span className='text-[12px] font-semibold flex items-center justify-center'>
                  {displayName?.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <FaUsers className='w-4 h-4 text-teal-500' />
              )}
            </div>

            {channel.unread_count > 0 && (
              <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white'>
                {channel.unread_count > 9 ? '9+' : channel.unread_count}
              </div>
            )}
          </div>
          <div className='text-xs truncate max-w-full h-[16px] leading-[16px] text-center'>{shortName}</div>
        </div>
      </div>
    </Tooltip>
  )
}

const CircleUserList = () => {
  const { channelID = '' } = useParams()
  const allChannels = useAtomValue(sortedChannelsAtom)
  const setChannels = useSetAtom(sortedChannelsAtom)
  const isMobile = useIsMobile()
  const { isPinned, togglePin, markAsUnread, isManuallyMarked } = useChannelActions()

  const items = useMemo(() => allChannels?.map((c) => c.name), [allChannels])
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.indexOf(active.id)
    const newIndex = items.indexOf(over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    const reordered = newItems
      ?.map((name) => allChannels.find((c) => c.name === name))
      .filter(Boolean) as ChannelWithGroupType[]

    setChannels(reordered)

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems))
    }, 1000)
  }

  return (
    <div className='w-full overflow-hidden'>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className='flex flex-wrap gap-3 p-2'>
            {items?.map((channelName) => {
              const channel = allChannels.find((c) => c.name === channelName)
              if (!channel) return null
              return (
                <ContextMenu.Root key={channel.name}>
                  <ContextMenu.Trigger asChild>
                    <SortableCircleUserItem
                      channel={channel}
                      isActive={channel.name === channelID}
                      onActivate={() => {}}
                    />
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content className='z-50 bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-md p-1'>
                      <ContextMenu.Item
                        className='px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer'
                        onClick={() => {
                          markAsUnread(channel)
                          setChannels((prev) => [...prev])
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
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default CircleUserList
