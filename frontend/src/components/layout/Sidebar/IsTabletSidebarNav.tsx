import { HiMenu } from 'react-icons/hi'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import { filterItems, useMentionUnreadCount, FilterList } from './SidebarContainer'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { useEffect, useState } from 'react'
import { useIsTablet } from '@/hooks/useMediaQuery'
import clsx from 'clsx'

export default function FilterTabs() {
  const { title, setTitle, setLabelID } = useSidebarMode()
  const { totalUnreadCount } = useUnreadMessageCount()
  const { mentionUnreadCount, resetMentions } = useMentionUnreadCount()

  const isTablet = useIsTablet()

  const { setMode } = useSidebarMode()

  const limitedTabs = filterItems.slice(0, 3)

  // Trích ra các label trong limitedTabs
  const limitedLabels = limitedTabs.map((tab) => tab.label)

  // Nếu title không nằm trong limitedTabs, render riêng
  const tabsToRender = limitedLabels.includes(title) ? limitedTabs : [{ label: title, icon: null }]

  const getBadgeCount = (label: string) => {
    if (['Trò chuyện', 'Chưa đọc'].includes(label)) return totalUnreadCount
    if (label === 'Nhắc đến') return mentionUnreadCount
    return 0
  }

  const handleClick = (label: string) => {
    setTitle(label)
    if (label === 'Nhắc đến') resetMentions()
  }

  const [showFilterList, setShowFilterList] = useState(false)
  const [shouldRenderFilterList, setShouldRenderFilterList] = useState(false)

  useEffect(() => {
    if (showFilterList) {
      setShouldRenderFilterList(true)
    } else {
      const timeout = setTimeout(() => setShouldRenderFilterList(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [showFilterList])

  return (
    <>
      <div className='flex items-cente p-2 pl-0 gap-2 w-full max-w-full md:mt-5'>
        <button
          onClick={() => {
            if (isTablet) {
              setShowFilterList(true)
              setMode('default')
            }
          }}
          className='w-7 h-7 shrink-0 rounded-full dark:bg-gray-700 flex items-center justify-center relative'
        >
          <HiMenu className='w-4 h-4 dark:text-white' />

          {(totalUnreadCount > 0 || mentionUnreadCount > 0) && (
            <span className='absolute top-0 right-0 w-[8px] h-[8px] bg-red-500 rounded-full' />
          )}
        </button>

        <div
          className={clsx(
            'flex flex-1 justify-between items-center rounded-full px-1 py-1 gap-[2px] overflow-hidden',
            tabsToRender.length > 1 && 'bg-gray-200 dark:bg-neutral-800'
          )}
        >
          {tabsToRender.map((tab) => {
            const isActive = tab.label === title
            const badgeCount = getBadgeCount(tab.label)

            const isSingleTab = tabsToRender.length === 1

            return (
              <div
                key={tab.label}
                className={clsx('relative flex items-center justify-center', isSingleTab ? 'w-1/3' : 'flex-1')}
              >
                <button
                  onClick={() => handleClick(tab.label)}
                  className={clsx(
                    'relative truncate px-2 py-0.5 rounded-full text-xs font-medium text-center w-full pr-5',
                    isActive
                      ? 'bg-white dark:bg-gray-500 dark:text-gray-200 text-black'
                      : 'bg-transparent text-zinc-400',
                    isSingleTab && isActive && 'border border-gray-300 dark:border-gray-600'
                  )}
                >
                  <span>{tab.label}</span>
                  {badgeCount > 0 && <span className='text-[10px] px-1 rounded-full leading-none'>{badgeCount}</span>}

                  {/* ❌ Nút X nằm bên trong button */}
                  {isSingleTab && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setLabelID('')
                        handleClick('Trò chuyện')
                      }}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[10px] cursor-pointer'
                    >
                      ✕
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {isTablet && shouldRenderFilterList && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowFilterList(false)}
            className={clsx(
              'fixed inset-0 bg-black bg-opacity-40 z-20 transition-opacity duration-300',
              showFilterList ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          />

          {/* Sidebar */}
          <div
            className={clsx(
              'fixed top-0 left-0 h-full w-60 bg-white dark:bg-neutral-800 shadow-lg z-30',
              showFilterList ? 'animate-slide-in-left' : 'animate-slide-out-left'
            )}
          >
            <button
              onClick={() => setShowFilterList(false)}
              className='dark:text-white text-xl absolute top-4 right-4 bg-transparent'
            >
              ✕
            </button>
            <div className='mt-14'>
              <FilterList onClose={() => setShowFilterList(false)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
