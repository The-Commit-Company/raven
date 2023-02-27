import { SearchIcon } from "@chakra-ui/icons"
import { Text, Avatar, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, List, ListItem, Stack, useColorMode, useDisclosure, Button } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { GoPrimitiveDot } from "react-icons/go"
import { RiUserAddLine } from "react-icons/ri"
import { useDebounce } from "../../../hooks/useDebounce"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { RemoveChannelMemberModal } from "./EditChannelDetails/RemoveChannelMemberModal"
import { User } from "../../../types/User/User"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

interface MemberDetailsProps {
    members: User[]
}

export const ChannelMemberDetails = ({ members }: MemberDetailsProps) => {

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

    const { isOpen: isAddMembersModalOpen, onOpen: onAddMembersModalOpen, onClose: onAddMembersModalClose } = useDisclosure()
    const { isOpen: isRemoveMembersModalOpen, onOpen: onRemoveMembersModalOpen, onClose: onRemoveMembersModalClose } = useDisclosure()
    const [selectedMember, setSelectedMember] = useState('')

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
                    placeholder='Find members' />
            </InputGroup>

            <List spacing={2}>
                {members.some(member => member.name === currentUser) &&
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
                    </ListItem>}

                {members.map(member => {
                    return (
                        <ListItem key={member.name} _hover={{ ...LISTHOVERSTYLE }} rounded='md'>
                            <HStack justifyContent='space-between' pr='3'>
                                <HStack p='2' spacing={3}>
                                    <Avatar size='sm' src={member.user_image} name={member.full_name} borderRadius='md' />
                                    <HStack spacing={1}>
                                        <Text fontWeight='semibold'>{member.first_name}</Text>
                                        <Icon as={GoPrimitiveDot} color='green.600' />
                                        <Text fontWeight='light'>{member.full_name}</Text>
                                    </HStack>
                                </HStack>
                                {members.some(member => member.name === currentUser) && member.name != currentUser && member.name != channelData[0].owner &&
                                    <Button colorScheme='blue' variant='link' size='xs' onClick={() => onMemberSelect(member)}>Remove</Button>}
                            </HStack>
                        </ListItem>
                    )
                })}

            </List>
            <AddChannelMemberModal isOpen={isAddMembersModalOpen} onClose={onAddMembersModalClose} />
            {selectedMember && <RemoveChannelMemberModal isOpen={isRemoveMembersModalOpen} onClose={onRemoveMembersModalClose} user_id={selectedMember} />}
        </Stack>
    )
}