import { AddChannelMembersModalContent } from "./AddChannelMemberModal"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useState } from "react"
import { Button, Dialog } from "@radix-ui/themes"
import { ButtonProps } from "@radix-ui/themes/dist/cjs/components/button"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { BiUserPlus } from "react-icons/bi"

interface AddMembersButtonProps extends ButtonProps {
    channelData: ChannelListItem,
}

export const AddMembersButton = ({ channelData, ...props }: AddMembersButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button variant="ghost" size='1' {...props}>
                    <BiUserPlus size='16' />Add members</Button>
            </Dialog.Trigger>

            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <AddChannelMembersModalContent
                    onClose={onClose}
                />
            </Dialog.Content>
        </Dialog.Root>
    )
}