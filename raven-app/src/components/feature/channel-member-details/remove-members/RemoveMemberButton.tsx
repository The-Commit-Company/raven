import { RemoveChannelMemberModal } from './RemoveChannelMemberModal'
import { useCallback, useState } from 'react'
import { AlertDialog } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Member } from '@/hooks/fetchers/useFetchChannelMembers'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'

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

    const isDesktop = useIsDesktop()

    if (isDesktop) {
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
    } else {
        return <Drawer open={isOpen}>
            <DrawerContent>
                <div className='min-h-48'>
                    {member &&
                        <RemoveChannelMemberModal
                            onClose={onClose}
                            member={member}
                        />
                    }
                </div>
            </DrawerContent>
        </Drawer>
    }

}