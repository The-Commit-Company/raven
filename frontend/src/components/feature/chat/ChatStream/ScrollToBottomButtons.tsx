// ScrollToBottomButtons.tsx - Component quản lý các nút scroll với UI cải tiến
import { Button } from '@radix-ui/themes'
import { FiArrowDown, FiMessageCircle } from 'react-icons/fi'

interface ScrollToBottomButtonsProps {
  hasNewMessages: boolean
  newMessageCount: number
  onGoToLatestMessages: () => void
}

export const ScrollToBottomButtons = ({
  hasNewMessages,
  newMessageCount,
  onGoToLatestMessages
}: ScrollToBottomButtonsProps) => {
  return (
    <>
      {/* Nút scroll đến tin nhắn mới - chỉ hiện khi có tin nhắn mới */}
      {hasNewMessages && newMessageCount > 0 && (
        <div className='fixed bottom-40 z-50 right-4 sm:right-10'>
          <Button
            className='shadow-lg bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 animate-pulse'
            onClick={onGoToLatestMessages}
            size='2'
          >
            <FiMessageCircle size={16} />
            <span className='font-medium'>{`${newMessageCount} tin nhắn mới`}</span>
            <FiArrowDown size={16} />
          </Button>
        </div>
      )}
    </>
  )
}
