import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, DropdownMenu, } from '@radix-ui/themes'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { UpdateAdminStatusButton } from './UpdateAdminStatusButton'
import { RemoveMemberDialog, useRemoveMember } from '../remove-members/RemoveMemberButton'
import { FiUserMinus } from 'react-icons/fi'
import { Member } from '@/hooks/fetchers/useFetchChannelMembers'

interface UserActionsButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    selectedMember: Member
}

export const UserActionsMenu = ({ channelData, updateMembers, selectedMember }: UserActionsButtonProps) => {

    const { setRemoveMember, ...removeMemberProps } = useRemoveMember()

    const onRemove = () => {
        setRemoveMember(selectedMember)
    }

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant='ghost' color='gray' className={'hover:bg-slate-3 cursor-pointer'} size='1'>
                        <BiDotsHorizontalRounded fontSize={'1rem'} />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className='z-50'>
                    <DropdownMenu.Item>
                        <UpdateAdminStatusButton
                            user={selectedMember}
                            channelID={channelData.name}
                            updateMembers={updateMembers} />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item color='red' onClick={onRemove} className='flex items-center gap-2'>
                        <FiUserMinus />
                        Remove from channel
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <RemoveMemberDialog {...removeMemberProps} />
        </>
    )
}