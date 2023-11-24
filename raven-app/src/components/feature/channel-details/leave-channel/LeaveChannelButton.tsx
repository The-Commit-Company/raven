import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { LeaveChannelModal } from './LeaveChannelModal'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { AlertDialog, Button } from '@radix-ui/themes'

interface LeaveChannelButtonProps {
    channelData: ChannelListItem,
    onClose: () => void
}

export const LeaveChannelButton = ({ channelData, onClose: onParentClose }: LeaveChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button color='red' variant='ghost' className={'text-left w-fit'}>
                    Leave channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={contentClass}>
                <LeaveChannelModal
                    onClose={onClose}
                    closeDetailsModal={onParentClose}
                    channelData={channelData} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}