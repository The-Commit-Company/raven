import { AddChannelMembersModalContent } from "./AddChannelMemberModal"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useState } from "react"
import { Button, Dialog, IconButton } from "@radix-ui/themes"
import { ButtonProps } from "@radix-ui/themes/dist/cjs/components/button"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { BiUserPlus } from "react-icons/bi"

interface AddMembersButtonProps extends ButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    isIconButton?: boolean,
    channelMembers?: ChannelMembers
}

export const AddMembersButton = ({ channelData, updateMembers, isIconButton = false, channelMembers, ...props }: AddMembersButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>

            {isIconButton ? <Dialog.Trigger>
                <IconButton variant='surface' color='gray' aria-label={"add members to channel"} {...props}>
                    <BiUserPlus size='18' />
                </IconButton>
            </Dialog.Trigger> : <Dialog.Trigger>
                <Button variant="ghost" size='1' {...props}>
                    <BiUserPlus size='16' />Add members</Button>
            </Dialog.Trigger>}

            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <AddChannelMembersModalContent
                    onClose={onClose}
                    channelMembers={channelMembers}
                    channelID={channelData.name}
                    channel_name={channelData.channel_name}
                    type={channelData.type}
                    updateMembers={updateMembers} />
            </Dialog.Content>

        </Dialog.Root>
    )
}