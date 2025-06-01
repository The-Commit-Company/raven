// 1. ChatStreamLoading.tsx - Component quản lý các loader
import { Loader } from '@/components/common/Loader'
import { memo } from 'react'
import { useInView } from 'react-intersection-observer'

interface ChatStreamLoadingProps {
  hasOlderMessages: boolean
  hasNewMessages: boolean
  isLoading: boolean
  onLoadOlderMessages: () => Promise<void>
  onLoadNewerMessages: () => void
}

const ChatStreamLoading = ({
  hasOlderMessages,
  hasNewMessages,
  isLoading,
  onLoadOlderMessages,
  onLoadNewerMessages
}: ChatStreamLoadingProps) => {
  const { ref: oldLoaderRef } = useInView({
    fallbackInView: true,
    initialInView: false,
    skip: !hasOlderMessages,
    onChange: async (inView) => {
      if (inView && hasOlderMessages) {
        await onLoadOlderMessages()
      }
    }
  })

  const { ref: newLoaderRef } = useInView({
    fallbackInView: true,
    skip: !hasNewMessages,
    initialInView: false,
    onChange: (inView) => {
      if (inView && hasNewMessages) {
        onLoadNewerMessages()
      }
    }
  })

  return (
    <>
      {/* Loader tin nhắn cũ */}
      <div ref={oldLoaderRef}>
        {hasOlderMessages && !isLoading && (
          <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
            <Loader />
          </div>
        )}
      </div>

      {/* Loader tin nhắn mới */}
      {hasNewMessages && (
        <div ref={newLoaderRef}>
          <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
            <Loader />
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ChatStreamLoading)
