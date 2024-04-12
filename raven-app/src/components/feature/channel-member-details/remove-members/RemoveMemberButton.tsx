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
    memberID: string,
    onParentClose: () => void
}

export const RemoveMemberButton = ({ onParentClose, channelData, updateMembers, selectedMember, memberID }: RemoveMemberButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        onParentClose()
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button size='2' className={'p-4 bg-transparent text-red-700 hover:bg-red-3 not-cal text-left justify-start'}>
                    <FiUserMinus />
                    Remove from channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <RemoveChannelMemberModal
                    memberID={memberID}
                    onClose={onClose}
                    user={selectedMember}
                    channelData={channelData}
                    updateMembers={updateMembers} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}