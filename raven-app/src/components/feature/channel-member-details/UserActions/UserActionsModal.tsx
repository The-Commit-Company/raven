import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Member } from '@/utils/channel/ChannelMembersProvider'
import { RemoveMemberButton } from '../remove-members/RemoveMemberButton'
import { Button, Dialog, Flex, Separator, Text } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { IoMdClose } from 'react-icons/io'
import { BiCrown, BiSolidCrown } from 'react-icons/bi'
import { useToast } from '@/hooks/useToast'
import { useFrappeGetCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner'

interface UserActionsModalProps {
    onClose: () => void,
    user: Member,
    channelData: ChannelListItem,
    updateMembers: () => void
}

export const UserActionsModal = ({ onClose, user, channelData, updateMembers }: UserActionsModalProps) => {

    const { updateDoc, error, loading: updatingMember, reset } = useFrappeUpdateDoc()
    const { toast } = useToast()

    const { data: member, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: user.name }),
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
            onClose()
        })
    }

    return (
        <Flex direction='column'>

            <Dialog.Title>
                <Flex direction='column' gap='2'>
                    <Flex justify={'between'} align={'center'}>
                        <Flex align={'center'} gap='2'>
                            <UserAvatar src={user.user_image ?? ''} alt={user.full_name} size='3' />
                            <Flex direction='column' gap='0'>
                                <Text className={'not-cal'}>{user.full_name}</Text>
                                <Text className={'not-cal text-gray-500 text-xs font-normal'}>{user.name}</Text>
                            </Flex>
                        </Flex>
                        <Dialog.Close>
                            <Button variant="soft" color="gray" size='1'>
                                <IoMdClose fontSize={'0.88rem'} />
                            </Button>
                        </Dialog.Close>
                    </Flex>
                    <Separator className={'w-full'} />
                </Flex>
            </Dialog.Title>

            <Flex direction='column' gap='2'>

                <ErrorBanner error={errorFetchingChannelMember} />
                <ErrorBanner error={error} />

                {user.is_admin ?
                    <Button size='2'
                        onClick={() => updateAdminStatus(0)}
                        className={'p-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 text-left justify-start'}>
                        <BiCrown />
                        {updatingMember ? 'Updating member status...' : 'Remove channel admin'}
                    </Button>
                    :
                    <Button size='2'
                        onClick={() => updateAdminStatus(1)}
                        className={'p-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 text-left justify-start'}>
                        <BiSolidCrown />
                        {updatingMember ? 'Updating member status...' : 'Make channel admin'}
                    </Button>
                }

                <RemoveMemberButton
                    onParentClose={onClose}
                    memberID={member?.message.name ?? ''}
                    channelData={channelData}
                    updateMembers={updateMembers}
                    selectedMember={user} />

            </Flex>

        </Flex>
    )
}