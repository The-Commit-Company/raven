import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { DeleteChannelModal } from './DeleteChannelModal'
import { BiTrash } from 'react-icons/bi'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'

interface DeleteChannelButtonProps {
    onClose: () => void,
    channelData: ChannelListItem,
    allowSettingChange: boolean
}

export const DeleteChannelButton = ({ onClose: onCloseParent, channelData, allowSettingChange }: DeleteChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return (
            <AlertDialog.Root open={open} onOpenChange={setOpen}>
                <AlertDialog.Trigger>
                    <Button className={'py-6 px-4 bg-transparent text-red-700 dark:text-red-500 hover:bg-red-3 dark:hover:bg-red-2 not-cal text-left justify-start rounded-none rounded-b-md'} disabled={!allowSettingChange}>
                        <BiTrash />
                        Delete channel
                    </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                    <DeleteChannelModal
                        onClose={onClose}
                        onCloseParent={onCloseParent}
                        channelData={channelData} />
                </AlertDialog.Content>
            </AlertDialog.Root>
        )
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button className={'py-6 px-4 bg-transparent text-red-700 dark:text-red-500 hover:bg-red-3 dark:hover:bg-red-2 not-cal text-left justify-start rounded-none'} disabled={!allowSettingChange}>
                        <BiTrash />
                        Delete channel
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className='pb-16 min-h-48 px-1 overflow-auto'>
                        <DeleteChannelModal
                            onClose={onClose}
                            isDrawer
                            onCloseParent={onCloseParent}
                            channelData={channelData} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
}