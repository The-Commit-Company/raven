import { useIsMobile } from '@/hooks/useMediaQuery'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import clsx from 'clsx'
import { MutableRefObject, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { VirtuosoHandle } from 'react-virtuoso'
import { FileDrop } from '../../file-upload/FileDrop'
import useFileUpload from '../ChatInput/FileInput/useFileUpload'
import ModalChatStream from './ModalChatStream'

// const randomPlaceholder = COOL_PLACEHOLDERS[Math.floor(Math.random() * (COOL_PLACEHOLDERS.length))]
interface ChatBoxBodyProps {
  channelData: ChannelListItem | DMChannelListItem
}

// Component chính hiển thị khung nội dung chat của một kênh (channel)
export const ModalChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const chatStreamRef = useRef<{ onUpArrow: () => void } | null>(null)


  const tiptapRef = useRef<{ focusEditor: () => void } | null>(null)

  const isMobile = useIsMobile()

  // Khi modal chỉnh sửa đóng, chúng ta cần focus lại editor
  // Không làm điều này trên mobile vì vậy sẽ mở bàn phím
  const onModalClose = useCallback(() => {
    if (!isMobile) {
      setTimeout(() => {
        tiptapRef.current?.focusEditor()
      }, 50)
    }
  }, [isMobile])

  // Quản lý toàn bộ quá trình upload file đính kèm
  const {
    fileInputRef,
    files,
    setFiles,
  } = useFileUpload(channelData.name)

 
  const { threadID } = useParams()

  return (
    <ChatBoxBodyContainer>
      <FileDrop // Component cho phép kéo thả file.
        files={files}
        ref={fileInputRef}
        onFileChange={setFiles}
        width={threadID ? 'w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]' : undefined}
        maxFiles={10}
        maxFileSize={10000000}
      >
        <ModalChatStream
          channelID={channelData.name}
          onModalClose={onModalClose}
          pinnedMessagesString={channelData.pinned_messages_string}
          virtuosoRef={virtuosoRef as MutableRefObject<VirtuosoHandle>}
          ref={chatStreamRef as any}
        />
      </FileDrop>
    </ChatBoxBodyContainer>
  )
}
// Container để chứa chat box body
const ChatBoxBodyContainer = ({ children }: { children: React.ReactNode }) => {
  const { threadID } = useParams()

  return (
    <div
      className={clsx('flex flex-col overflow-hidden px-2 pt-16 justify-end h-full', threadID ? 'sm:pl-4' : 'sm:px-4')}
    >
      {children}
    </div>
  )
}
