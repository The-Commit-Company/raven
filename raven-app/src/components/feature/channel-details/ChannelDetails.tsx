import { Box, HStack, Stack, useColorMode, Text, Divider, Icon } from "@chakra-ui/react"
import { useContext } from "react"
import { UserContext } from "../../../utils/auth/UserProvider"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { EditChannelNameButton } from "./rename-channel/EditChannelNameButton"
import { EditDescriptionButton } from "./edit-channel-description/EditDescriptionButton"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { LeaveChannelButton } from "./leave-channel/LeaveChannelButton"

interface ChannelDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    onClose: () => void
}

export const ChannelDetails = ({ channelData, channelMembers, onClose }: ChannelDetailsProps) => {

    const { colorMode } = useColorMode()
    const { currentUser } = useContext(UserContext)

    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    const admin = Object.values(channelMembers).find(user => user.is_admin === 1)
    const users = useGetUserRecords()

    return (
        <Stack spacing='4'>

            <Box {...BOXSTYLE}>
                <HStack justifyContent='space-between' alignItems='self-start'>
                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Channel name</Text>
                        <HStack spacing={1}>
                            <Icon as={getChannelIcon(channelData?.type)} />
                            <Text fontSize='sm'>{channelData?.channel_name}</Text>
                        </HStack>
                    </Stack>
                    <EditChannelNameButton channelID={channelData.name} channel_name={channelData.channel_name} channelType={channelData.type} isDisabled={channelData.is_archived == 1} />
                </HStack>
            </Box>

            <Box {...BOXSTYLE}>
                <Stack spacing='4'>

                    <HStack justifyContent='space-between' alignItems='self-start'>
                        <Stack>
                            <Text fontWeight='semibold' fontSize='sm'>Channel description</Text>
                            <Text fontSize='sm' color='gray.500'>
                                {channelData && channelData.channel_description && channelData.channel_description.length > 0 ? channelData.channel_description : 'No description'}
                            </Text>
                        </Stack>
                        <EditDescriptionButton channelData={channelData} is_in_box={true} isDisabled={channelData.is_archived == 1} />
                    </HStack>

                    <Divider />

                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Created by</Text>
                        <HStack>
                            {channelData?.owner && <Text fontSize='sm'>{users[channelData.owner]?.full_name}</Text>}
                            <Text fontSize='sm' color='gray.500'>on {DateObjectToFormattedDateString(new Date(channelData?.creation ?? ''))}</Text>
                        </HStack>
                    </Stack>

                    {channelData?.type != 'Open' && <>
                        <Divider />
                        <Stack>
                            <Text fontWeight='semibold' fontSize='sm'>Channel admin</Text>
                            <HStack>
                                {admin ? <Text fontSize='sm'>{admin.full_name}</Text> : <Text fontSize='sm' color='gray.500'>No administrator</Text>}
                            </HStack>
                        </Stack>
                    </>}

                    {/* users can only leave channels they are members of */}
                    {/* users cannot leave open channels */}
                    {channelMembers[currentUser] && channelData?.type != 'Open' && channelData.is_archived == 0 &&
                        <>
                            <Divider />
                            <LeaveChannelButton channelData={channelData} onClose={onClose} />
                        </>
                    }

                </Stack>
            </Box>
        </Stack>
    )
}