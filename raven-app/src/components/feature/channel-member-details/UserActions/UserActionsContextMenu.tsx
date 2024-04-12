import { Member } from '@/utils/channel/ChannelMembersProvider'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, DropdownMenu, } from '@radix-ui/themes'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { RemoveMemberButton } from '../remove-members/RemoveMemberButton'
import { UpdateAdminStatusButton } from './UpdateAdminStatusButton'

interface UserActionsButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    selectedMember: Member
}

export const UserActionsMenu = ({ channelData, updateMembers, selectedMember }: UserActionsButtonProps) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant='ghost' color='gray' className={'hover:bg-slate-3 cursor-pointer'} size='1'>
                    <BiDotsHorizontalRounded fontSize={'1rem'} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item>
                    <UpdateAdminStatusButton
                        user={selectedMember}
                        channelID={channelData.name}
                        updateMembers={updateMembers} />
                </DropdownMenu.Item>
                <DropdownMenu.Item color='red'>
                    <RemoveMemberButton
                        channelData={channelData}
                        updateMembers={updateMembers}
                        selectedMember={selectedMember} />
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}