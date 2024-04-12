import { RemoveChannelMemberModal } from './RemoveChannelMemberModal'
import { Member } from '@/utils/channel/ChannelMembersProvider'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { FiUserMinus } from 'react-icons/fi'
interface RemoveMemberButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    selectedMember: Member,
}

export const RemoveMemberButton = ({ channelData, updateMembers, selectedMember }: RemoveMemberButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <div className={'flex items-center gap-2'}>
                    <FiUserMinus />
                    Remove from channel
                </div>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <RemoveChannelMemberModal
                    onClose={onClose}
                    user={selectedMember}
                    channelData={channelData}
                    updateMembers={updateMembers} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}