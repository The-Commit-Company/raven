import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ArchiveChannelButton } from "./archive-channel/ArchiveChannelButton"
import { ChangeChannelTypeButton } from "./change-channel-type/ChangeChannelTypeButton"
import { DeleteChannelButton } from "./delete-channel/DeleteChannelButton"
import { Flex } from "@radix-ui/themes"

type Props = {
    onClose: () => void
    channelData: ChannelListItem
}

export const ChannelSettings = ({ onClose, channelData }: Props) => {
    return (
        <Flex direction='column' gap='4' className={'h-96'}>
            <ChangeChannelTypeButton channelData={channelData} />
            <ArchiveChannelButton onClose={onClose} channelData={channelData} />
            <DeleteChannelButton onClose={onClose} channelData={channelData} />
        </Flex>
    )
}