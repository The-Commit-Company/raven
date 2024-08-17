import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Dialog } from '@radix-ui/themes'
import CreateMeetingForm from './CreateMeetingForm'

interface CreateMeetingDialogProps {
    isOpen: boolean,
    setOpen: (open: boolean) => void
    channelData: ChannelListItem
}

const CreateMeetingDialog = ({ isOpen, setOpen, channelData }: CreateMeetingDialogProps) => {


    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={isOpen} onOpenChange={setOpen}>
                <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                    <CreateMeetingForm
                        channelData={channelData}
                        onClose={() => setOpen(false)}
                    />
                </Dialog.Content>
            </Dialog.Root>
        )
    } else {
        return <Drawer open={isOpen} onOpenChange={setOpen}>
            <DrawerContent>
                <div className='pb-16 min-h-48 px-1 overflow-auto'>
                    <CreateMeetingForm
                        channelData={channelData}
                        onClose={() => setOpen(false)}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    }
}

export default CreateMeetingDialog