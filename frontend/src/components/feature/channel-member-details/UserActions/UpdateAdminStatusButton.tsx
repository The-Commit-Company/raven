import { BiCrown, BiSolidCrown } from 'react-icons/bi'
import { useFrappeGetCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { Member } from '@/hooks/fetchers/useFetchChannelMembers'

interface UpdateAdminStatusButtonProps {
    user: Member,
    channelID: string,
    updateMembers: () => void
}

export const UpdateAdminStatusButton = ({ user, channelID, updateMembers }: UpdateAdminStatusButtonProps) => {

    const { updateDoc, loading: updatingMember, reset } = useFrappeUpdateDoc()

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
            toast.success('Member has been made an admin')
            updateMembers()
            reset()
        }).catch((e) => {
            toast.error('Failed to update member status', {
                description: getErrorMessage(e)
            })
            reset()
        })
    }

    if (user.is_admin) {
        return <div className={'flex items-center gap-2'}
            onClick={() => updateAdminStatus(0)}>
            <BiCrown />
            {updatingMember ? 'Updating member status...' : 'Dismiss admin'}
        </div>
    } else {
        return <div className={'flex items-center gap-2'}
            onClick={() => updateAdminStatus(1)}>
            <BiSolidCrown />
            {updatingMember ? 'Updating member status...' : 'Make channel admin'}
        </div>
    }
}