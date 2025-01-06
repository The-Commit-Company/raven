import { useContext, useMemo } from "react"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { EditChannelNameButton } from "./rename-channel/EditChannelNameButton"
import { EditDescriptionButton } from "./edit-channel-description/EditDescriptionButton"
import { LeaveChannelButton } from "./leave-channel/LeaveChannelButton"
import { Box, Flex, Separator, Switch, Text } from "@radix-ui/themes"
import { DateMonthYear } from "@/utils/dateConversions"
import { ChannelMembers } from "@/hooks/fetchers/useFetchChannelMembers"
import { useGetUser } from "@/hooks/useGetUser"
import ChannelPushNotificationToggle from "./ChannelPushNotificationToggle"

interface ChannelDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    onClose: () => void
}

export const ChannelDetails = ({ channelData, channelMembers, onClose }: ChannelDetailsProps) => {

    const { currentUser } = useContext(UserContext)

    const channelOwner = useGetUser(channelData.owner)

    const { channelMember, isAdmin } = useMemo(() => {
        const channelMember = channelMembers[currentUser]
        return {
            channelMember,
            isAdmin: channelMember?.is_admin == 1
        }
    }, [channelMembers, currentUser])

    return (
        <Flex direction='column' gap='4' className={'h-[66vh] pb-2 sm:h-96'}>

            <Box className={'p-4 rounded-md border border-gray-6'}>
                <Flex justify={'between'}>
                    <Flex direction={'column'}>
                        <Text weight='medium' size='2'>Channel name</Text>
                        <Flex gap='1' pt='1' align='center'>
                            <ChannelIcon type={channelData.type} size='14' />
                            <Text size='2'>{channelData?.channel_name}</Text>
                        </Flex>
                    </Flex>
                    <EditChannelNameButton
                        channelID={channelData.name}
                        channel_name={channelData.channel_name}
                        className=""
                        channelType={channelData.type}
                        disabled={channelData.is_archived == 1 && !isAdmin} />
                </Flex>
            </Box>
            <ChannelPushNotificationToggle channelID={channelData.name}
                channelMember={channelMember}
            />

            <Box className={'p-4 rounded-md border border-gray-6'}>
                <Flex direction='column' gap='4'>
                    <Flex justify={'between'}>
                        <Flex direction={'column'} gap='1'>
                            <Text weight='medium' size='2'>Channel description</Text>
                            <Text size='1' color='gray'>
                                {channelData && channelData.channel_description && channelData.channel_description.length > 0 ? channelData.channel_description : 'No description'}
                            </Text>
                        </Flex>
                        <EditDescriptionButton channelData={channelData} is_in_box={true} disabled={channelData.is_archived == 1 && !isAdmin} />
                    </Flex>

                    <Separator className={'w-full'} />

                    <Flex direction={'column'} gap='1'>
                        <Text weight='medium' size='2'>Created by</Text>
                        <Flex gap='1'>
                            {channelData?.owner && <Text size='1'>{channelOwner?.full_name ?? channelData?.owner}</Text>}
                            {channelData.creation && <Text size='1' color='gray' as='span'>on <DateMonthYear date={channelData?.creation} /></Text>}
                        </Flex>
                    </Flex>

                    {/* users can only leave channels they are members of */}
                    {/* users cannot leave open channels */}
                    {channelMember && Object.keys(channelMembers).length > 1 && channelData?.type != 'Open' && channelData.is_archived == 0 &&
                        <>
                            <Separator className={'w-full'} />
                            <LeaveChannelButton channelData={channelData} onClose={onClose} />
                        </>
                    }

                </Flex>
            </Box>
        </Flex>
    )
}