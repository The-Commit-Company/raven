import { Member } from '@/utils/channel/ChannelMembersProvider'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useState } from 'react'
import { Button, Dialog } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { BiChevronRight } from 'react-icons/bi'
import { UserActionsModal } from './UserActionsModal'

interface UserActionsButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    selectedMember: Member
}

export const UserActionsButton = ({ channelData, updateMembers, selectedMember }: UserActionsButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button variant='ghost' color='gray' className={'hover:bg-slate-3 cursor-pointer'} size='1'>
                    <BiChevronRight fontSize={'1.2rem'} />
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <UserActionsModal
                    onClose={onClose}
                    user={selectedMember}
                    channelData={channelData}
                    updateMembers={updateMembers} />
            </Dialog.Content>
        </Dialog.Root>
    )
}