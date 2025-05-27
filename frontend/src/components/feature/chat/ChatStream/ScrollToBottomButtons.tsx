import { FiArrowDown, FiMessageCircle } from 'react-icons/fi'

interface ScrollToBottomButtonsProps {
  hasNewMessages: boolean
  newMessageCount: number
  onGoToLatestMessages: () => void
  onScrollToBottom: () => void
  isAtBottom?: boolean
}

export const ScrollToBottomButtons = ({
  hasNewMessages,
  newMessageCount,
  onGoToLatestMessages,
  onScrollToBottom,
  isAtBottom
}: ScrollToBottomButtonsProps) => {
  return (
    <>
      {/* Nút scroll đến tin nhắn mới */}
      {hasNewMessages && newMessageCount > 0 && (
        <div className='fixed bottom-40 z-50 right-4 sm:right-10'>
          <div
            className='relative flex items-center gap-3 px-4 py-3 rounded-full border shadow-md bg-[#1e2633] border-[#2c3748] cursor-pointer group active:scale-95 transition-all'
            onClick={onGoToLatestMessages}
          >
            {/* Icon tin nhắn */}
            <div className='w-6 h-6 flex items-center justify-center rounded-full bg-[#3390ec] text-white flex-shrink-0'>
              <FiMessageCircle size={12} />
            </div>

            {/* Text */}
            <span className='text-sm font-medium text-white whitespace-nowrap'>
              {newMessageCount === 1 ? '1 tin nhắn mới' : `${newMessageCount} tin nhắn mới`}
            </span>

            {/* Mũi tên xuống */}
            <div className='w-6 h-6 flex items-center justify-center text-[#b0b8c4] group-hover:text-white transition-colors'>
              <FiArrowDown size={14} />
            </div>

            {/* Badge */}
            {newMessageCount > 1 && (
              <div className='absolute -top-2 -right-2 bg-[#3390ec] text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold shadow'>
                {newMessageCount > 99 ? '99+' : newMessageCount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nút scroll đến cuối */}
      {!hasNewMessages && !isAtBottom && newMessageCount <= 0 && (
        <div className='fixed bottom-40 z-50 right-4 sm:right-10'>
          <div
            className='w-12 h-12 flex items-center justify-center rounded-full border shadow-md bg-[#1e2633] border-[#2c3748] cursor-pointer active:scale-95 group transition-all'
            onClick={onScrollToBottom}
          >
            <FiArrowDown size={20} className='text-[#b0b8c4] group-hover:text-white transition-colors' />
          </div>
        </div>
      )}
    </>
  )
}
