import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { LeaveChannelModal } from './LeaveChannelModal'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

interface LeaveChannelButtonProps {
    channelData: ChannelListItem,
    onClose: () => void
}

export const LeaveChannelButton = ({ channelData, onClose: onParentClose }: LeaveChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button color='red' variant='ghost' className={'text-left w-fit'}>
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
}