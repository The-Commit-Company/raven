import { useContext } from "react"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { EditChannelNameButton } from "./rename-channel/EditChannelNameButton"
import { EditDescriptionButton } from "./edit-channel-description/EditDescriptionButton"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { LeaveChannelButton } from "./leave-channel/LeaveChannelButton"
import { Box, Flex, Separator, Text } from "@radix-ui/themes"
import { DateMonthYear } from "@/utils/dateConversions"

interface ChannelDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    onClose: () => void
}

export const ChannelDetails = ({ channelData, channelMembers, onClose }: ChannelDetailsProps) => {

    const { currentUser } = useContext(UserContext)
    const admin = Object.values(channelMembers).find(user => user.is_admin === 1)
    const users = useGetUserRecords()

    return (
        <Flex direction='column' gap='4' className={'h-96'}>

            <Box className={'p-4 rounded-md border border-gray-6'}>
                <Flex justify={'between'}>
                    <Flex direction={'column'}>
                        <Text weight='medium' size='2'>Channel name</Text>
                        <Flex gap='1' pt='1' align='center'>
                            <ChannelIcon type={channelData.type} size='14' />
                            <Text size='2'>{channelData?.channel_name}</Text>
                        </Flex>
                    </Flex>
                    <EditChannelNameButton channelID={channelData.name} channel_name={channelData.channel_name} channelType={channelData.type} disabled={channelData.is_archived == 1} />
                </Flex>
            </Box>

            <Box className={'p-4 rounded-md border border-gray-6'}>
                <Flex direction='column' gap='4'>
                    <Flex justify={'between'}>
                        <Flex direction={'column'} gap='1'>
                            <Text weight='medium' size='2'>Channel description</Text>
                            <Text size='1' color='gray'>
                                {channelData && channelData.channel_description && channelData.channel_description.length > 0 ? channelData.channel_description : 'No description'}
                            </Text>
                        </Flex>
                        <EditDescriptionButton channelData={channelData} is_in_box={true} disabled={channelData.is_archived == 1} />
                    </Flex>

                    <Separator className={'w-full'} />

                    <Flex direction={'column'} gap='1'>
                        <Text weight='medium' size='2'>Created by</Text>
                        <Flex gap='1'>
                            {channelData?.owner && <Text size='1'>{users[channelData.owner]?.full_name}</Text>}
                            {channelData.creation && <Text size='1' color='gray' as='span'>on <DateMonthYear date={channelData?.creation} /></Text>}
                        </Flex>
                    </Flex>

                    {channelData?.type != 'Open' && <>
                        <Separator className={'w-full'} />
                        <Flex direction={'column'} gap='1'>
                            <Text weight='medium' size='2'>Channel admin</Text>
                            <Flex>
                                {admin ? <Text size='1'>{admin.full_name}</Text> : <Text size='2' color='gray'>No administrator</Text>}
                            </Flex>
                        </Flex>
                    </>}

                    {/* users can only leave channels they are members of */}
                    {/* users cannot leave open channels */}
                    {channelMembers[currentUser] && channelData?.type != 'Open' && channelData.is_archived == 0 &&
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