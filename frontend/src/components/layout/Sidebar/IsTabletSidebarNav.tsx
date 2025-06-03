import { HiMenu } from 'react-icons/hi'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import { filterItems, useMentionUnreadCount, FilterList } from './SidebarContainer'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsTablet } from '@/hooks/useMediaQuery'
import clsx from 'clsx'

export default function FilterTabs() {
  const [showFilterList, setShowFilterList] = useState(false)

  const { title, setTitle } = useSidebarMode()
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

  return (
    <>
      <div className='flex items-center text-white p-2 pl-0 gap-2 w-full max-w-full md:mt-5'>
        <button
          onClick={() => {
            if (isTablet) {
              setShowFilterList(true)
              setMode('default')
            }
          }}
          className='w-7 h-7 shrink-0 rounded-full dark:bg-gray-700 flex items-center justify-center'
        >
          <HiMenu className='w-4 h-4' />
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

            return (
              <button
                key={tab.label}
                onClick={() => handleClick(tab.label)}
                className={clsx(
                  'relative truncate px-2 py-0.5 rounded-full text-xs font-medium text-center',
                  tabsToRender.length === 1 ? 'w-1/3' : 'flex-1',
                  isActive ? 'bg-white dark:bg-gray-500 dark:text-gray-200 text-black' : 'bg-transparent text-zinc-400',
                  tabsToRender.length === 1 && isActive && 'border border-gray-300 dark:border-gray-600'
                )}
              >
                <span>{tab.label}</span>
                {badgeCount > 0 && <span className='text-[10px] px-1 rounded-full leading-none'>{badgeCount}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Slide-in FilterList for tablet */}
      <AnimatePresence>
        {showFilterList && isTablet && (
          <>
            {/* Overlay đen trong suốt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='fixed inset-0 bg-black z-40'
              onClick={() => setShowFilterList(false)}
            />

            {/* Sidebar FilterList */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className='fixed top-0 left-0 h-full w-64 bg-white dark:bg-neutral-900 z-50 shadow-lg p-4'
            >
              <button
                onClick={() => setShowFilterList(false)}
                className='dark:text-white text-xl absolute top-4 right-4'
              >
                ✕
              </button>
              <div className='mt-14'>
                <FilterList onClose={() => setShowFilterList(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
