import { AddChannelMembersModalContent } from "./AddChannelMemberModal"
import { RiUserAddLine } from "react-icons/ri"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { BiUserPlus } from "react-icons/bi"
import { useState } from "react"
import { useModalContentStyle } from "@/hooks/useModalContentStyle"
import { Button, Dialog, IconButton } from "@radix-ui/themes"

interface AddMembersButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    is_in_empty_state?: boolean
}

export const AddMembersButton = ({ channelData, updateMembers, is_in_empty_state }: AddMembersButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>

            {is_in_empty_state ? <Dialog.Trigger>
                <Button variant="ghost" size='1'>
                    <BiUserPlus fontSize={'1.1rem'} />Add people</Button>
            </Dialog.Trigger> : <Dialog.Trigger>
                <IconButton aria-label={"add members to channel"}>
                    <RiUserAddLine />
                </IconButton>
            </Dialog.Trigger>}

            <Dialog.Content className={contentClass}>
                <AddChannelMembersModalContent
                    onClose={onClose}
                    channelID={channelData.name}
                    channel_name={channelData.channel_name}
                    type={channelData.type}
                    updateMembers={updateMembers} />
            </Dialog.Content>

        </Dialog.Root>
    )
}