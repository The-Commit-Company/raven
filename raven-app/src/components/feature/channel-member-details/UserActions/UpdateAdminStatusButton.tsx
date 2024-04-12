import { Member } from '@/utils/channel/ChannelMembersProvider'
import { BiCrown, BiSolidCrown } from 'react-icons/bi'
import { useToast } from '@/hooks/useToast'
import { useFrappeGetCall, useFrappeUpdateDoc } from 'frappe-react-sdk'

interface UpdateAdminStatusButtonProps {
    user: Member,
    channelID: string,
    updateMembers: () => void
}

export const UpdateAdminStatusButton = ({ user, channelID, updateMembers }: UpdateAdminStatusButtonProps) => {

    const { updateDoc, loading: updatingMember, reset } = useFrappeUpdateDoc()
    const { toast } = useToast()

    const { data: member } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelID, user_id: user.name }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const updateAdminStatus = async (admin: 1 | 0) => {
        return updateDoc('Raven Channel Member', member?.message.name ?? '', {
            is_admin: admin
        }).then(() => {
            toast({
                title: 'Member has been made an admin successfully',
                variant: 'success',
                duration: 1000
            })
            updateMembers()
            reset()
        }).catch(() => {
            toast({
                title: 'Failed to update member status',
                variant: 'destructive',
                duration: 1000
            })
            reset()
        })
    }

    if (user.is_admin) {
        return <div className={'flex items-center gap-2'}
            onClick={() => updateAdminStatus(0)}>
            <BiCrown />
            {updatingMember ? 'Updating member status...' : 'Remove channel admin'}
        </div>
    } else {
        return <div className={'flex items-center gap-2'}
            onClick={() => updateAdminStatus(1)}>
            <BiSolidCrown />
            {updatingMember ? 'Updating member status...' : 'Make channel admin'}
        </div>
    }
}