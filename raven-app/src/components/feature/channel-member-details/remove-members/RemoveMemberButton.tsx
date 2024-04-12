import { RemoveChannelMemberModal } from './RemoveChannelMemberModal'
import { Member } from '@/utils/channel/ChannelMembersProvider'
import { useCallback, useState } from 'react'
import { AlertDialog } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

export const useRemoveMember = () => {
    const [member, setMember] = useState<null | Member>(null)
    const onClose = useCallback(() => {
        setMember(null)
    }, [])
    return {
        member,
        setRemoveMember: setMember,
        isOpen: member !== null,
        onClose
    }
}


interface RemoveMemberDialogProps {
    member: Member | null,
    isOpen: boolean,
    onClose: () => void
}

export const RemoveMemberDialog = ({ member, isOpen, onClose }: RemoveMemberDialogProps) => {
    return <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
        <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
            {member &&
                <RemoveChannelMemberModal
                    onClose={onClose}
                    member={member}
                />
            }
        </AlertDialog.Content>
    </AlertDialog.Root>
}