import { SearchIcon } from "@chakra-ui/icons"
import { Text, Avatar, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, List, ListItem, Stack, useColorMode, Button, Box, Center } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { RiUserAddLine } from "react-icons/ri"
import { useDebounce } from "../../../hooks/useDebounce"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { RemoveChannelMemberModal } from "./EditChannelDetails/RemoveChannelMemberModal"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { RiVipCrownFill } from "react-icons/ri"
import { scrollbarStyles } from "../../../styles"
import { ChannelMembers, Member } from "@/pages/ChatSpace"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface MemberDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    activeUsers: string[],
    updateMembers: () => void
}

export const ChannelMemberDetails = ({ channelData, channelMembers, activeUsers, updateMembers }: MemberDetailsProps) => {

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { colorMode } = useColorMode()
    const { currentUser } = useContext(UserContext)

    const LISTHOVERSTYLE = {
        bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
        cursor: 'pointer'
    }

    const modalManager = useModalManager()

    const onAddMembersModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    const onRemoveMembersModalOpen = () => {
        modalManager.openModal(ModalTypes.RemoveChannelMember)
    }

    const channelMembersArray = Object.values(channelMembers)

    const filteredMembers = channelMembersArray.filter((member) =>
        member?.full_name?.toLowerCase().includes(debouncedText.toLowerCase())
    )

    const [selectedMember, setSelectedMember] = useState('')

    const onMemberSelect = (member: Member) => {
        setSelectedMember(member.name)
        onRemoveMembersModalOpen()
    }

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
                    {channelMembers[currentUser] && channelData.type !== 'Open' && (
                        <ListItem _hover={{ ...LISTHOVERSTYLE }} rounded='md' onClick={onAddMembersModalOpen}>
                            <HStack p='2' spacing={3}>
                                <IconButton
                                    size='sm'
                                    aria-label='add members'
                                    icon={<RiUserAddLine />}
                                    colorScheme='blue'
                                    variant='outline'
                                />
                                <Text>Add members</Text>
                            </HStack>
                        </ListItem>
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
                                        {channelMembers[currentUser] &&
                                            channelMembers[currentUser].is_admin === 1 &&
                                            member.name !== currentUser &&
                                            channelData?.type !== 'Open' && (
                                                <Button
                                                    colorScheme='blue'
                                                    variant='link'
                                                    size='xs'
                                                    onClick={() => onMemberSelect(member)}>
                                                    Remove
                                                </Button>
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
            <AddChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.AddChannelMember}
                onClose={modalManager.closeModal}
                type={channelData.type}
                channel_name={channelData.channel_name}
                updateMembers={updateMembers} />
            {selectedMember && <RemoveChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.RemoveChannelMember}
                onClose={modalManager.closeModal}
                user_id={selectedMember}
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />}
        </Stack>
    )
}