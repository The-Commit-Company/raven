import { useState, useRef, useEffect } from 'react'
import {
  HiChatAlt2,
  HiOutlineInbox,
  HiOutlineFlag,
  HiOutlineAtSymbol,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineHashtag,
  HiOutlineCheckCircle,
  HiMenuAlt2,
  HiOutlineEyeOff,
  HiOutlineViewGrid,
  HiOutlineCog
} from 'react-icons/hi'
import { Tooltip } from '@radix-ui/themes'
import { useSidebarMode } from '@/utils/layout/sidebar'

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
  const [isHoverMenuOpen, setIsHoverMenuOpen] = useState(false)
  const [isHiding, setIsHiding] = useState(false)
  const { mode, setMode, tempMode } = useSidebarMode()

  const isCollapsed = false
  const isIconOnly = tempMode === 'show-only-icons'
  const sidebarMinWidth = 3
  const sidebarDefaultExpandedWidth = 15

  const timerRef = useRef<number>()

  const clearTimer = () => clearTimeout(timerRef.current)

  // const toggleCollapse = () => {
  //   if (isCollapsed || isIconOnly) {
  //     setMode('default')
  //     setIsHoverMenuOpen(false)
  //     setIsHiding(false)
  //     clearTimer()
  //   } else {
  //     setMode('hide-filter')
  //     timerRef.current = window.setTimeout(() => setIsHoverMenuOpen(true), 800)
  //   }
  // }

  const toggleCollapse = () => {
    if (mode === 'hide-filter' || mode === 'show-only-icons') {
      setMode('default')
      setIsHoverMenuOpen(false)
      setIsHiding(false)
      clearTimer()
    } else {
      setMode('hide-filter')
      timerRef.current = window.setTimeout(() => setIsHoverMenuOpen(true), 800)
    }
  }

  useEffect(() => {
    if (!sidebarRef?.current) return

    if (mode === 'show-only-icons') {
      sidebarRef?.current.resize(sidebarMinWidth)
    } else if (mode === 'default') {
      sidebarRef?.current.resize(sidebarDefaultExpandedWidth)
    } else if (mode === 'hide-filter') {
      sidebarRef?.current.resize(sidebarMinWidth)
    }
  }, [mode, sidebarRef])

  const handleToggleIconMode = () => {
    setMode(isIconOnly ? 'default' : 'show-only-icons')
  }

  const handleMouseEnter = () => {
    if (!isCollapsed) return
    clearTimer()
    setIsHiding(false)
    setIsHoverMenuOpen(true)
  }

  const handleMouseLeave = () => {
    if (!isCollapsed || !isHoverMenuOpen) return
    setIsHiding(true)
    timerRef.current = window.setTimeout(() => {
      setIsHoverMenuOpen(false)
      setIsHiding(false)
    }, 800)
  }

  useEffect(() => clearTimer, [])

  const renderCollapsedPopup = () => {
    if (!isHoverMenuOpen) return null
    return (
      <div
        style={{ top: '50px' }}
        className={`absolute left-0 w-60 z-50 bg-white dark:bg-gray-1 border border-l-0
        border-gray-200 dark:border-gray-700 rounded-md shadow-md
        ${isHiding ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
      >
        <FilterList />
      </div>
    )
  }

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out
        dark:bg-gray-1`}
    >
      <div className={`flex items-center ${isIconOnly ? 'justify-center' : 'justify-between'}`}>
        <div className='flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
          <span
            onMouseEnter={isCollapsed ? handleMouseEnter : undefined}
            onMouseLeave={isCollapsed ? handleMouseLeave : undefined}
            className='relative inline-block cursor-pointer py-4 group'
            style={{ zIndex: 999 }}
          >
            <HiMenuAlt2
              onClick={toggleCollapse}
              className={`w-5 h-5 ${!isIconOnly && 'ml-3 mr-2'} p-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-700`}
            />

            {isCollapsed && renderCollapsedPopup()}

            {!isCollapsed && (
              <div
                className='absolute left-0 w-44 z-50 hidden group-hover:block
                  bg-white dark:bg-gray-1 border border-gray-200 dark:border-gray-700
                  rounded-md shadow-md'
              >
                <ul className='py-1'>
                  {/* {!isIconOnly && (
                    <li
                      onClick={() => setMode('hide-filter')}
                      className='flex items-center gap-2 px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                    >
                      <HiOutlineEyeOff className='w-4 h-4' />
                      Ẩn bộ lọc
                    </li>
                  )} */}
                  <li
                    onClick={handleToggleIconMode}
                    className='flex items-center gap-2 px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                  >
                    <HiOutlineViewGrid className='w-4 h-4' />
                    {isIconOnly ? 'Hiển thị bộ lọc' : 'Chỉ hiển thị biểu tượng'}
                  </li>
                </ul>
              </div>
            )}
          </span>
          {!isCollapsed && !isIconOnly && <span>Bộ lọc</span>}
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

export function FilterList() {
  const { title, setTitle, tempMode } = useSidebarMode()
  const isIconOnly = tempMode === 'show-only-icons'

  return (
    <ul className={`space-y-1 text-sm text-gray-12 px-3 ${isIconOnly ? '' : 'py-2'}`}>
      {filterItems.map((item, idx) => {
        const isActive = item.label === title
        return (
          <li
            key={idx}
            onClick={() => setTitle(item.label)}
            className={`flex justify-center items-center gap-2 py-1.5 rounded-md cursor-pointer
              hover:bg-gray-3 ${isActive ? 'bg-gray-4 font-semibold' : ''}`}
          >
            <Tooltip content={item.label} side='right' delayDuration={300}>
              <div className='w-6 h-6 flex items-center justify-center shrink-0'>
                <item.icon className='w-5 h-5' />
              </div>
            </Tooltip>

            {/* Chỉ hiện text nếu không phải icon-only */}
            {!isIconOnly && <span className='truncate flex-1 min-w-0'>{item.label}</span>}
          </li>
        )
      })}
    </ul>
  )
}
