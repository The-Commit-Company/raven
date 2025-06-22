import { Dialog } from '@radix-ui/themes'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { CreateConversationContent } from './CreateConversationContent'
import { useAtomValue } from 'jotai'
import { createConversationChannelsAtom } from './atoms/conversationAtom'

interface CreateConversationModalProps {
  name: string
  label: string
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

const CreateConversationModal = ({ name, label, isOpen, setIsOpen }: CreateConversationModalProps) => {
  const isDesktop = useIsDesktop()
  const channels = useAtomValue(createConversationChannelsAtom)

  return isDesktop ? (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className='z-[300] bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-[900px] max-w-full max-h-[90vh] overflow-y-scroll'>
        <CreateConversationContent channels={channels} name={name} setIsOpen={setIsOpen} label={label} />
      </Dialog.Content>
    </Dialog.Root>
  ) : (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className='pb-16 overflow-y-scroll min-h-96'>
          <CreateConversationContent channels={channels} name={name} setIsOpen={setIsOpen} label={label} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateConversationModal
