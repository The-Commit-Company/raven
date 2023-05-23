import { SearchIcon } from "@chakra-ui/icons"
import { Text, Avatar, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, List, ListItem, Stack, useColorMode, Button, Box, Center } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { RiUserAddLine } from "react-icons/ri"
import { useDebounce } from "../../../hooks/useDebounce"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { RemoveChannelMemberModal } from "./EditChannelDetails/RemoveChannelMemberModal"
import { User } from "../../../types/User/User"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"

interface MemberDetailsProps {
    members: User[]
    activeUsers: string[]
}

export const ChannelMemberDetails = ({ members, activeUsers }: MemberDetailsProps) => {

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { colorMode } = useColorMode()
    const { currentUser } = useContext(UserContext)
    const { channelData } = useContext(ChannelContext)

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

    const [selectedMember, setSelectedMember] = useState('')
    const filteredMembers = members.filter(member => member.full_name.toLowerCase().includes(debouncedText.toLowerCase()))

    const onMemberSelect = (member: User) => {
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

            <Box maxH='340px' overflow='hidden' overflowY='scroll'>
                <List spacing={2}>
                    {members.some(member => member.name === currentUser) && channelData?.type != 'Open' &&
                        <ListItem _hover={{ ...LISTHOVERSTYLE }} rounded='md' onClick={onAddMembersModalOpen}>
                            <HStack p='2' spacing={3}>
                                <IconButton
                                    size='sm'
                                    aria-label={"add members"}
                                    icon={<RiUserAddLine />}
                                    colorScheme='blue'
                                    variant='outline' />
                                <Text>Add members</Text>
                            </HStack>
                        </ListItem>
                    }

                    {filteredMembers.length > 0 ? (
                        <List>
                            {filteredMembers.map(member => (
                                <ListItem key={member.name} _hover={{ ...LISTHOVERSTYLE }} rounded='md'>
                                    <HStack justifyContent='space-between' pr='3'>
                                        <HStack p='2' spacing={3}>
                                            <Avatar size='sm' src={member.user_image} name={member.full_name} borderRadius='md' />
                                            <HStack spacing={1}>
                                                <Text fontWeight='semibold'>{member.first_name}</Text>
                                                {activeUsers.includes(member.name) ? (
                                                    <Icon as={BsFillCircleFill} color='green.500' h='8px' />
                                                ) : (
                                                    <Icon as={BsCircle} h='8px' />
                                                )}
                                                <Text fontWeight='light'>{member.full_name}</Text>
                                            </HStack>
                                        </HStack>
                                        {members.some(member => member.name === currentUser) && member.name != currentUser && member.name != channelData?.owner && channelData?.type != 'Open' && (
                                            <Button colorScheme='blue' variant='link' size='xs' onClick={() => onMemberSelect(member)}>Remove</Button>
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
                onClose={modalManager.closeModal} />
            {selectedMember && <RemoveChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.RemoveChannelMember}
                onClose={modalManager.closeModal}
                user_id={selectedMember} />}
        </Stack>
    )
}