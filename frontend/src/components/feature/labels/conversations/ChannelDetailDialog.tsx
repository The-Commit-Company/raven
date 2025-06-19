import { Dialog, IconButton } from '@radix-ui/themes'
import { useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { HiX } from 'react-icons/hi'

import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'

import { useGetUser } from '@/hooks/useGetUser'
import { ModalChatBoxBody } from '../../chat/ChatStream/ModalChatBoxBody'
import { UnifiedChannel } from '../../direct-messages/useUnifiedChannelList'
import { disableMessageAtom, openInModalAtom } from './atoms/statusModalAtom'

type Props = {
  channel: UnifiedChannel | null
  onClose: () => void
}

const ChannelDetailDialog = ({ channel, onClose }: Props) => {
  const isDesktop = useIsDesktop()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isDM = channel?.is_direct_message === 1
  const user = useGetUser(channel?.peer_user_id)

  const setDisableMessage = useSetAtom(disableMessageAtom)
  const setOpenInModal = useSetAtom(openInModalAtom)

  const [isLoading, setIsLoading] = useState(false)
  // Scroll xuống đáy sau khi load xong
  useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      })
    }
  }, [isLoading, channel?.name])

  // Set trạng thái modal và disable gửi tin nhắn
  useEffect(() => {
    const isOpen = !!channel
    setDisableMessage(isOpen)
    setOpenInModal(isOpen)
    return () => {
      setDisableMessage(false)
      setOpenInModal(false)
    }
  }, [channel])

  const content = (
    <div className='flex flex-col max-h-[90vh]'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-1 px-4 py-3 border-b border-gray-3 dark:border-gray-6 flex items-center justify-between'>
        <Dialog.Title className='text-base font-semibold m-0 text-center'>
          Thông tin kênh {isDM ? user?.full_name : channel?.channel_name}
        </Dialog.Title>
        {isDesktop ? (
          <Dialog.Close>
            <IconButton className='cursor-pointer' variant='ghost' color='gray' size='2' aria-label='Đóng'>
              <HiX className='w-5 h-5' />
            </IconButton>
          </Dialog.Close>
        ) : (
          <button onClick={onClose}>
            <HiX className='w-5 h-5' />
          </button>
        )}
      </div>

      {/* Scrollable */}
      <div ref={scrollRef} className='flex-1 overflow-hidden'>
        {channel && <ModalChatBoxBody channelData={channel} />}
        <div ref={bottomRef} />
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog.Root open={!!channel} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Content className='max-w-[800px] max-h-[90vh] z-[99] p-0'>{content}</Dialog.Content>
      </Dialog.Root>
    )
  }

  return (
    <Drawer open={!!channel} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className='pt-4 px-2 overflow-y-scroll'>{content}</div>
      </DrawerContent>
    </Drawer>
  )
}

export default ChannelDetailDialog
