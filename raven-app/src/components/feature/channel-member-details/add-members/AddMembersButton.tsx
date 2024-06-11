import { AddChannelMembersModalContent } from "./AddChannelMemberModalContent"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useState } from "react"
import { Button, Dialog } from "@radix-ui/themes"
import { ButtonProps } from "@radix-ui/themes/dist/cjs/components/button"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { BiUserPlus } from "react-icons/bi"
import clsx from "clsx"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/layout/Drawer"

interface AddMembersButtonProps extends ButtonProps {
    channelData: ChannelListItem,
}

export const AddMembersButton = ({ channelData, ...props }: AddMembersButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <Button variant="ghost" size='1' {...props} className={clsx("text-nowrap", props.className)}>
                        <BiUserPlus size='18' />Add</Button>
                </Dialog.Trigger>

                <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                    <AddChannelMembersModalContent
                        onClose={onClose}
                    />
                </Dialog.Content>
            </Dialog.Root>
        )
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="ghost" size='1' {...props} className={clsx("text-nowrap", props.className)}>
                    <BiUserPlus size='18' />Add</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className='pb-16 min-h-96 px-1 overflow-auto'>
                    <AddChannelMembersModalContent
                        onClose={onClose}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    }


}