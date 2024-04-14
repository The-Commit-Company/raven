import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ArchiveChannelButton } from "./archive-channel/ArchiveChannelButton"
import { ChangeChannelTypeButton } from "./change-channel-type/ChangeChannelTypeButton"
import { DeleteChannelButton } from "./delete-channel/DeleteChannelButton"
import { Box, Flex, Separator } from "@radix-ui/themes"

type Props = {
    onClose: () => void
    channelData: ChannelListItem
}

export const ChannelSettings = ({ onClose, channelData }: Props) => {
    return (
        <div className={'h-96'}>
            <Box className={'rounded-md border border-gray-6'}>
                <Flex direction='column'>
                    <ChangeChannelTypeButton channelData={channelData} />
                    <Separator className={'w-full'} />
                    <ArchiveChannelButton onClose={onClose} channelData={channelData} />
                    <Separator className={'w-full'} />
                    <DeleteChannelButton onClose={onClose} channelData={channelData} />
                </Flex>
            </Box>
        </div>
    )
}