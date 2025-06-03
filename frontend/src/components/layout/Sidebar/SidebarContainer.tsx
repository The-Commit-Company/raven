import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { Tooltip } from '@radix-ui/themes'
import { useEffect, useRef } from 'react'
import {
  HiChatAlt2,
  HiMenuAlt2,
  HiOutlineAtSymbol,
  HiOutlineCheckCircle,
  HiOutlineCog,
  HiOutlineFlag,
  HiOutlineHashtag,
  HiOutlineInbox,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineUsers
} from 'react-icons/hi'

import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'

export const useMentionUnreadCount = () => {
  const { data: mentionsCount, mutate } = useFrappeGetCall<{ message: number }>(
    'raven.api.mentions.get_unread_mention_count',
    undefined,
    undefined,
    {
      revalidateOnFocus: true,
      focusThrottleInterval: 1000 * 60 * 5
    }
  )

  useFrappeEventListener('raven_mention', () => {
    mutate()
  })

  const resetMentions = () => {
    mutate({ message: 0 }, { revalidate: false })
  }

  return { mentionUnreadCount: mentionsCount?.message || 0, resetMentions }
}

export const filterItems = [
  { label: 'Trò chuyện', icon: HiChatAlt2 },
  { label: 'Chưa đọc', icon: HiOutlineInbox },
  { label: 'Đã gắn cờ', icon: HiOutlineFlag },
  { label: 'Nhắc đến', icon: HiOutlineAtSymbol },
  { label: 'Nhãn', icon: HiOutlineTag },
  { label: 'Cuộc trò chuyện riêng tư', icon: HiOutlineUser },
  { label: 'Trò chuyện nhóm', icon: HiOutlineUsers },
  // { label: 'Docs', icon: HiOutlineDocumentText },
  { label: 'Chủ đề', icon: HiOutlineHashtag },
  { label: 'Xong', icon: HiOutlineCheckCircle }
]

export default function SidebarContainer({ sidebarRef }: { sidebarRef: React.RefObject<any> }) {
  const { mode, setMode, tempMode } = useSidebarMode()
  const { totalUnreadCount } = useUnreadMessageCount()

  const isCollapsed = false
  const isIconOnly = tempMode === 'show-only-icons'
  const sidebarMinWidth = 3
  const sidebarDefaultExpandedWidth = 15

  const timerRef = useRef<number>()

  const clearTimer = () => clearTimeout(timerRef.current)

  useEffect(() => {
    if (!sidebarRef?.current) return

    if (mode === 'show-only-icons') {
      sidebarRef?.current.resize(sidebarMinWidth)
    } else if (mode === 'default') {
      sidebarRef?.current.resize(sidebarDefaultExpandedWidth)
    }
  }, [mode, sidebarRef])

  const handleToggleIconMode = () => {
    setMode(isIconOnly ? 'default' : 'show-only-icons')
  }

  useEffect(() => clearTimer, [])

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out
        dark:bg-gray-1`}
    >
      <div className={`flex items-center ${isIconOnly ? 'justify-center' : 'justify-between'}`}>
        <div className='flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
          <span className='relative inline-block cursor-pointer py-3 group' style={{ zIndex: 999 }}>
            <HiMenuAlt2
              // onClick={toggleCollapse}
              onClick={handleToggleIconMode}
              className={`w-5 h-5 ${!isIconOnly && 'ml-3 mr-2'} p-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-700`}
            />
          </span>
          {!isCollapsed && !isIconOnly && <span className='text-base'>Bộ lọc</span>}
        </div>

        {tempMode === 'default' && (
          <HiOutlineCog className='w-5 h-5 pr-3 cursor-pointer hover:text-gray-900 dark:hover:text-white' />
        )}
      </div>

      {tempMode === 'default' && <FilterList />}
      {isIconOnly && <FilterList />}
    </div>
  )
}


interface FilterListProps {
  onClose?: () => void
}

export function FilterList({ onClose }: FilterListProps) {
  const { title, setTitle, tempMode } = useSidebarMode()
  const isIconOnly = tempMode === 'show-only-icons'

  const { totalUnreadCount } = useUnreadMessageCount()
  const { mentionUnreadCount, resetMentions } = useMentionUnreadCount()

  const handleClick = (label: string) => {
    setTitle(label)
    if (label === 'Nhắc đến') resetMentions()
    if (onClose) onClose()
  }

  return (
    <ul className={`space-y-1 text-sm text-gray-12 px-3 ${isIconOnly ? '' : 'py-2'}`}>
      {filterItems.map((item, idx) => {
        const isActive = item.label === title
        let badgeCount = 0

        if (['Trò chuyện', 'Chưa đọc'].includes(item.label)) badgeCount = totalUnreadCount
        if (item.label === 'Nhắc đến') badgeCount = mentionUnreadCount

        return (
          <li
            key={idx}
            onClick={() => handleClick(item.label)}
            className={`flex ${isIconOnly ? 'justify-center' : 'justify-between'} relative items-center gap-2 py-1.5 rounded-md cursor-pointer
              hover:bg-gray-3 ${isActive ? 'bg-gray-4 font-semibold' : ''}`}
          >
            <div className='flex items-center gap-2'>
              <Tooltip content={item.label} side='right' delayDuration={300}>
                <div className='w-6 h-6 flex items-center justify-center shrink-0'>
                  <item.icon className='w-5 h-5' />
                </div>
              </Tooltip>
              {!isIconOnly && <span className='truncate flex-1 min-w-0'>{item.label}</span>}
            </div>

            {badgeCount > 0 && (
              <span
                style={{
                  position: isIconOnly ? 'absolute' : 'static',
                  right: isIconOnly ? '3%' : undefined,
                  top: isIconOnly ? 'auto' : undefined,
                  transform: isIconOnly ? 'translateY(-50%)' : undefined,
                  fontSize: '0.7rem',
                  lineHeight: '1rem',
                  fontWeight: 500,
                  marginRight: isIconOnly ? '0px' : '1rem'
                }}
              >
                {badgeCount}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}