import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Button, Dialog } from '@radix-ui/themes'
import clsx from 'clsx'
import { useState } from 'react'
import { RiPushpinLine } from 'react-icons/ri'
import { PinnedMessageModalContent } from './PinnedMessageModalContent'

interface ViewPinnedMessagesButtonProps {
  pinnedMessagesString: string
}

export const ViewPinnedMessagesButton = ({ pinnedMessagesString }: ViewPinnedMessagesButtonProps) => {
  const pinnedMessages = pinnedMessagesString ? pinnedMessagesString.split('\n')?.length : 0

  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  if (!pinnedMessages) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button size='1' variant='soft' color='gray' aria-label='View pinned messages' title='View pinned messages'>
          <RiPushpinLine size='14' />
          {pinnedMessages}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'sm:min-w-[720px]')}>
        <PinnedMessageModalContent onClose={onClose} />
      </Dialog.Content>
    </Dialog.Root>
  )
}
