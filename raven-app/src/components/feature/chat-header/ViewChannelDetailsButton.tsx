import { RiUserLine } from "react-icons/ri"
import { ViewChannelDetailsModalContent } from "../channels/ViewChannelDetailsModal"
import { useContext, useState } from "react"
import { ActiveUsersContext } from "@/utils/users/ActiveUsersProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { Button, Dialog, Tooltip } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"

interface ViewChannelDetailsButtonProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ViewChannelDetailsButton = ({ channelData, channelMembers, updateMembers }: ViewChannelDetailsButtonProps) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    const activeUsers = useContext(ActiveUsersContext)
    const totalMembers = Object.keys(channelMembers).length

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='view members/ channel details'>
                <Dialog.Trigger>
                    <Button className={'pr-2 pl-1 w-fit'} variant='surface' color='gray'>
                        {Object.keys(channelMembers).length > 0 ? <div className={'flex -space-x-2 rtl:space-x-reverse'}>
                            {Object.entries(channelMembers).map(([name, member], index) => {
                                const isActive = activeUsers.includes(name)
                                if (index < 3)
                                    return <UserAvatar key={name} src={member.user_image ?? 'undefined'} alt={member.full_name ?? member.name} radius='full' isActive={isActive} variant='solid' />
                            })}
                            {totalMembers > 3 && <div className={'z-10 flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-gray-800 rounded-full'}>+ {totalMembers - 3}</div>}
                        </div> : <RiUserLine />}
                    </Button>
                </Dialog.Trigger>
            </Tooltip>
            <ViewChannelDetailsModalContent
                onClose={onClose}
                channelData={channelData}
                channelMembers={channelMembers}
                activeUsers={activeUsers}
                updateMembers={updateMembers} />
        </Dialog.Root>
    )
}