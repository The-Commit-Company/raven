import { BsArchive } from "react-icons/bs";
import { ArchiveChannelModal } from "./ArchiveChannelModal";
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";
import { useState } from "react";
import { useModalContentStyle } from "@/hooks/useModalContentStyle";
import { AlertDialog, Button } from "@radix-ui/themes";

interface ArchiveChannelButtonProps {
    onClose: () => void,
    channelData: ChannelListItem
}

export const ArchiveChannelButton = ({ onClose: onCloseParent, channelData }: ArchiveChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button variant='surface' color='gray'>
                    <BsArchive />
                    Archive channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={contentClass}>
                <ArchiveChannelModal
                    onClose={onCloseParent}
                    onCloseViewDetails={onClose}
                    channelData={channelData} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}