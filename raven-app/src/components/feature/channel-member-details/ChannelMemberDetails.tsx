import { SearchIcon } from "@chakra-ui/icons"
import { Text, Avatar, HStack, Icon, Input, InputGroup, InputLeftElement, List, ListItem, Stack, useColorMode, Box, Center } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { useDebounce } from "../../../hooks/useDebounce"
import { UserContext } from "../../../utils/auth/UserProvider"
import { RiVipCrownFill } from "react-icons/ri"
import { scrollbarStyles } from "../../../styles"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { AddMembersButton } from "./add-members/AddMembersButton"
import { RemoveMemberButton } from "./remove-members/RemoveMemberButton"

interface MemberDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    activeUsers: string[],
    updateMembers: () => void
}

export const ChannelMemberDetails = ({ channelData, channelMembers, activeUsers, updateMembers }: MemberDetailsProps) => {

    const { colorMode } = useColorMode()
    const LISTHOVERSTYLE = {
        bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
        cursor: 'pointer'
    }

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { currentUser } = useContext(UserContext)

    const channelMembersArray = Object.values(channelMembers)

    const filteredMembers = channelMembersArray.filter((member) =>
        member?.full_name?.toLowerCase().includes(debouncedText.toLowerCase())
    )

    return (
        <Stack spacing={4}>

            <InputGroup>
                <InputLeftElement
                    pointerEvents='none'
                    children={<SearchIcon color='gray.300' />} />
                <Input
                    autoFocus
                    onChange={handleChange}
                    type='text'
                    placeholder='Find members'
                    value={debouncedText} />
            </InputGroup>

            <Box maxH='340px' overflow='hidden' overflowY='scroll' sx={scrollbarStyles(colorMode)}>

                <List spacing={2}>
                    {/* if current user is a channel member and the channel is not a open channel, user can add more members to the channel */}
                    {channelMembers[currentUser] && channelData.type !== 'Open' && (
                        <AddMembersButton
                            channelData={channelData}
                            updateMembers={updateMembers}
                            style={LISTHOVERSTYLE}
                            is_in_list={true} />
                    )}

                    {filteredMembers.length > 0 ? (
                        <List>
                            {filteredMembers.map(member => (
                                <ListItem key={member.name} _hover={{ ...LISTHOVERSTYLE }} rounded='md'>
                                    <HStack justifyContent='space-between' pr='3'>
                                        <HStack p='2' spacing={3}>
                                            <Avatar size='sm' src={member.user_image ?? ''} name={member.full_name} borderRadius='md' />
                                            <HStack spacing={1}>
                                                <Text fontWeight='semibold'>{member.first_name}</Text>
                                                {activeUsers.includes(member.name) ? (
                                                    <Icon as={BsFillCircleFill} color='green.500' h='8px' />
                                                ) : (
                                                    <Icon as={BsCircle} h='8px' />
                                                )}
                                                <Text fontWeight='light'>{member.full_name}</Text>
                                                {member.name === currentUser && <Text fontWeight='light'>(You)</Text>}
                                                {channelMembers[member.name].is_admin == 1 && <Icon as={RiVipCrownFill} color='yellow.400' h='14px' />}
                                            </HStack>
                                        </HStack>
                                        {/* if current user is a channel member and admin they can remove users other than themselves if the channel is not open */}
                                        {channelMembers[currentUser] &&
                                            channelMembers[currentUser].is_admin === 1 &&
                                            member.name !== currentUser &&
                                            channelData?.type !== 'Open' && (
                                                <RemoveMemberButton
                                                    channelData={channelData}
                                                    channelMembers={channelMembers}
                                                    updateMembers={updateMembers}
                                                    selectedMember={member.name} />
                                            )}
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Center h='10vh'>
                            <Text textAlign='center' fontSize='sm'>
                                No matches found for <strong>{searchText}</strong>
                            </Text>
                        </Center>
                    )}
                </List>
            </Box>
        </Stack>
    )
}