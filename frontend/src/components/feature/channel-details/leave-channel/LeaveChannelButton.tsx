import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { LeaveChannelModal } from './LeaveChannelModal'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'

interface LeaveChannelButtonProps {
    channelData: ChannelListItem,
    onClose: () => void
}

export const LeaveChannelButton = ({ channelData, onClose: onParentClose }: LeaveChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return (
            <AlertDialog.Root open={open} onOpenChange={setOpen}>
                <AlertDialog.Trigger>
                    <Button variant='ghost' className={'text-left text-red-700 hover:bg-red-3 w-fit not-cal'}>
                        Leave channel
                    </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                    <LeaveChannelModal
                        onClose={onClose}
                        closeDetailsModal={onParentClose}
                        channelData={channelData} />
                </AlertDialog.Content>
            </AlertDialog.Root>
        )
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant='ghost' className={'text-left text-red-700 hover:bg-red-3 w-fit not-cal'}>
                        Leave channel
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className='pb-16 min-h-48 px-1 overflow-auto'>
                        <LeaveChannelModal
                            onClose={onClose}
                            isDrawer
                            closeDetailsModal={onParentClose}
                            channelData={channelData} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
}