import { RemoveChannelMemberModal } from './RemoveChannelMemberModal'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { AlertDialog, Button } from '@radix-ui/themes'

interface RemoveMemberButtonProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void,
    selectedMember: string
}

export const RemoveMemberButton = ({ channelData, channelMembers, updateMembers, selectedMember }: RemoveMemberButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button variant='ghost' className={'hover:bg-[var(--slate-3)]'} size='1'>
                    Remove
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={contentClass}>
                <RemoveChannelMemberModal
                    onClose={onClose}
                    user_id={selectedMember}
                    channelData={channelData}
                    channelMembers={channelMembers}
                    updateMembers={updateMembers} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}