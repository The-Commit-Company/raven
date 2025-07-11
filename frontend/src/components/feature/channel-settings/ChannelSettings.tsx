import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ArchiveChannelButton } from "./archive-channel/ArchiveChannelButton"
import { ChangeChannelTypeButton } from "./change-channel-type/ChangeChannelTypeButton"
import { DeleteChannelButton } from "./delete-channel/DeleteChannelButton"
import { Box, Flex, Separator, Text } from "@radix-ui/themes"

type Props = {
    onClose: () => void
    channelData: ChannelListItem,
    allowSettingChange: boolean
}

export const ChannelSettings = ({ onClose, channelData, allowSettingChange }: Props) => {
    return (
        <div className={'h-96'}>
            <Flex direction='column' gap='3'>
                <Box className={'rounded-md border border-gray-6'}>
                    <Flex direction='column'>
                        <ChangeChannelTypeButton channelData={channelData} allowSettingChange={allowSettingChange} />
                        <Separator className={'w-full'} />
                        <ArchiveChannelButton onClose={onClose} channelData={channelData} allowSettingChange={allowSettingChange} />
                        <Separator className={'w-full'} />
                        <DeleteChannelButton onClose={onClose} channelData={channelData} allowSettingChange={allowSettingChange} />
                    </Flex>
                </Box>
                <Flex direction='column' gap='1'>
                    <Text size='1' weight='light' className={'px-1'}>Only channel admins or Raven admins are allowed to change the channel settings</Text>
                    <Text size='1' weight='light' className={'px-1'}>General channel cannot be modified/ removed</Text>
                </Flex>
            </Flex>
        </div>
    )
}