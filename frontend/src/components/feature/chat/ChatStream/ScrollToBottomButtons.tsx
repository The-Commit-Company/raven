// 2. ScrollToBottomButtons.tsx - Component quản lý các nút scroll
import { Button } from '@radix-ui/themes'
import { FiArrowDown } from 'react-icons/fi'

interface ScrollToBottomButtonsProps {
  hasNewMessages: boolean
  newMessageCount: number
  showScrollToBottomButton: boolean
  onGoToLatestMessages: () => void
}

export const ScrollToBottomButtons = ({
  hasNewMessages,
  newMessageCount,
  showScrollToBottomButton,
  onGoToLatestMessages
}: ScrollToBottomButtonsProps) => {
  return (
    <>
      {/* Nút scroll đến tin nhắn mới */}
      {hasNewMessages && newMessageCount > 0 && (
        <div className='fixed bottom-40 z-50 right-10 cursor-pointer'>
          <Button className='shadow-lg' onClick={onGoToLatestMessages}>
            {`${newMessageCount} tin nhắn mới`}
            <FiArrowDown size={18} />
          </Button>
        </div>
      )}

      {/* Nút scroll đến cuối */}
      {!hasNewMessages && showScrollToBottomButton && (
        <div className='fixed bottom-40 z-50 right-10 cursor-pointer'>
          <Button className='shadow-lg' onClick={onGoToLatestMessages}>
            <FiArrowDown size={18} />
          </Button>
        </div>
      )}
    </>
  )
}
