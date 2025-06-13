import { useState } from 'react'
import { Button, Dialog } from '@radix-ui/themes'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { CreateConversationContent } from './CreateConversationContent'
import { commonButtonStyle } from '../LabelItemMenu'



const CreateConversationButton = ({ label }: { label: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const button = (
    <Button
      style={commonButtonStyle}
      className='block w-full text-left justify-start text-black font-light dark:text-white cursor-pointer hover:bg-indigo-500 dark:hover:bg-gray-700 bg-transparent hover:text-white transition-colors'
    >
      Thêm cuộc trò chuyện
    </Button>
  )

  return isDesktop ? (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>{button}</Dialog.Trigger>
      <Dialog.Content className='z-[300] bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-[900px] max-w-full max-h-[90vh] overflow-y-auto'>
        <CreateConversationContent setIsOpen={setIsOpen} label={label} />
      </Dialog.Content>
    </Dialog.Root>
  ) : (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent>
        <div className='pb-16 overflow-y-scroll min-h-96'>
          <CreateConversationContent setIsOpen={setIsOpen} label={label} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}


export default CreateConversationButton
