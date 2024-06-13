import { BiBox } from "react-icons/bi";
import { ArchiveChannelModal } from "./ArchiveChannelModal";
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";
import { useState } from "react";
import { AlertDialog, Button } from "@radix-ui/themes";
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog";

interface ArchiveChannelButtonProps {
    onClose: () => void,
    channelData: ChannelListItem,
    allowSettingChange: boolean
}

export const ArchiveChannelButton = ({ onClose: onCloseParent, channelData, allowSettingChange }: ArchiveChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button className={'py-6 px-4 bg-transparent text-zinc-900 dark:text-white not-cal hover:bg-gray-3 text-left justify-start rounded-none'} disabled={!allowSettingChange}>
                    <BiBox />
                    Archive channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <ArchiveChannelModal
                    onClose={onCloseParent}
                    onCloseViewDetails={onClose}
                    channelData={channelData} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}