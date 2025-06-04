import { useMergedUnreadCount } from '@/components/feature/direct-messages/DirectMessageListCustom'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useUnreadMessages } from '@/utils/layout/sidebar'
import { ChannelInfo, useCircleUserList } from '@/utils/users/CircleUserListProvider'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import { IoTriangle } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'

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
    if (e.button !== 0 || dragging) return // Chỉ điều hướng nếu là chuột trái và không đang kéo
    clearManualMark(channel.name)
    onActivate?.()
    navigate(`/${workspaceID}/${channel.name}`)
  }

  const shortName = useMemo(() => {
    const firstWord = displayName?.split(' ')[0] || ''
    return firstWord.length > 6 ? firstWord.slice(0, 6) + '...' : firstWord
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
              <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white'>
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

const CircleUserList = ({ size }: { size?: number }) => {
  const { selectedChannels, setSelectedChannels } = useCircleUserList()
  const unread_count = useUnreadMessages()
  const { isPinned, togglePin, markAsUnread, isManuallyMarked } = useChannelActions()
  const channelID = useParams().channelID || ''
  const enrichedSelectedChannels = useMergedUnreadCount(selectedChannels as any, unread_count?.message ?? [])
  const [items, setItems] = useState(enrichedSelectedChannels.map((c) => c.name))
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const newItems = enrichedSelectedChannels.map((c) => c.name)
    const isEqual = newItems.length === items.length && newItems.every((v, i) => v === items[i])
    if (!isEqual) {
      setItems(newItems)
    }
  }, [enrichedSelectedChannels])

  const sensors = useSensors(useSensor(PointerSensor))
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

  const isMobile = useIsMobile() // ✅ đúng hook mobile
  const [showExtraList, setShowExtraList] = useState(false)

  const itemsPerRow = 6
  const [rows, setRows] = useState<string[][]>([])

  const hasMoreRows = isMobile && Math.ceil(items.length / itemsPerRow) > 1

  useEffect(() => {
    if (!isMobile) return

    const tempRows: string[][] = []
    const itemsPerRow = 5

    for (let i = 0; i < items.length; i += itemsPerRow) {
      tempRows.push(items.slice(i, i + itemsPerRow))
    }

    const hasMoreRows = tempRows.length > 1

    if (hasMoreRows && tempRows[0]) {
      tempRows[0].push('__TOGGLE__')
    }

    setRows(tempRows)
  }, [items, isMobile])

  return enrichedSelectedChannels.length > 0 ? (
    <div className='w-full overflow-hidden'>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {/* ✅ Nếu isMobile → chia dòng + toggle */}
          {isMobile ? (
            <div className='flex flex-col gap-5 w-full'>
              {rows.map((row, rowIndex) => {
                if (rowIndex > 0 && !showExtraList) return null

                return (
                  <div key={rowIndex} className='flex gap-3 w-full items-start'>
                    {row.map((channelName) => {
                      if (channelName === '__TOGGLE__') {
                        return (
                          <div key='__TOGGLE__' className='flex flex-col items-center space-y-1 bg-transparent ml-auto'>
                            <button
                              onClick={() => setShowExtraList((prev) => !prev)}
                              className='flex flex-col items-center bg-transparent'
                            >
                              <div className='w-8 h-8 border-2 rounded-full flex items-center justify-center'>
                                <IoTriangle
                                  className={`w-3 h-3 transition-transform duration-200 dark:text-gray-200 ${
                                    showExtraList ? '' : '-rotate-180'
                                  }`}
                                />
                              </div>
                              <span className='text-xs dark:text-gray-200 mt-1'>
                                {showExtraList ? 'Ẩn' : 'Hiển t..'}
                              </span>
                            </button>
                          </div>
                        )
                      }

                      const channel = enrichedSelectedChannels.find((c) => c.name === channelName)
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

                    {/* ✅ Chỉ chèn vào dòng đầu tiên */}
                    {rowIndex === 0 && hasMoreRows && (
                      <div className='flex items-center'>
                        <button
                          onClick={() => setShowExtraList((prev) => !prev)}
                          className='text-sm text-blue-600 dark:text-blue-400 underline'
                        >
                          {showExtraList ? 'Ẩn bớt' : 'Hiện thêm'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            // ✅ Nếu không phải mobile: dùng layout cũ flex-wrap
            <div>
              <div
                className={clsx(
                  'flex flex-wrap gap-3 overflow-hidden pl-0 pr-0 p-2 mb-5 transition-all duration-300 ease-in-out',
                  showAll ? 'max-h-[1000px]' : 'max-h-[120px]'
                )}
              >
                {items.map((channelName) => {
                  const channel = enrichedSelectedChannels.find((c) => c.name === channelName)
                  if (!channel) return null
                  return (
                    <ContextMenu.Root key={channel.name}>
                      <ContextMenu.Trigger asChild>
                        <div className='w-[50px] h-[50px]'>
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

              {items.length > 10 && (
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className='text-xs mt-2 text-blue-500 hover:underline'
                >
                  {showAll ? 'Ẩn bớt' : 'Hiện thêm'}
                </button>
              )}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  ) : null
}

export default CircleUserList
