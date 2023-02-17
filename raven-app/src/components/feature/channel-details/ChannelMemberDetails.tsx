import { SearchIcon } from "@chakra-ui/icons"
import { Text, Avatar, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, List, ListItem, Stack, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { GoPrimitiveDot } from "react-icons/go"
import { RiUserAddLine } from "react-icons/ri"
import { useDebounce } from "../../../hooks/useDebounce"

interface MemberDetailsProps {
    members: {
        name: string,
        full_name: string,
        user_image: string,
        first_name: string
    }[]
}

export const ChannelMemberDetails = ({ members }: MemberDetailsProps) => {

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { colorMode } = useColorMode()

    const LISTHOVERSTYLE = {
        bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
        cursor: 'pointer'
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

                <ListItem _hover={{ ...LISTHOVERSTYLE }} rounded='md'>
                    <HStack p='2' spacing={3}>
                        <IconButton size='sm' aria-label={"add members"} icon={<RiUserAddLine />} colorScheme='blue' variant='outline' />
                        <Text>Add members</Text>
                    </HStack>
                </ListItem>

                {members.map(member => {
                    return (
                        <ListItem key={member.name} _hover={{ ...LISTHOVERSTYLE }} rounded='md'>
                            <HStack p='2' spacing={3}>
                                <Avatar size='sm' src={member.user_image} name={member.full_name} borderRadius='md' />
                                <HStack spacing={1}>
                                    <Text fontWeight='semibold'>{member.first_name}</Text>
                                    <Icon as={GoPrimitiveDot} color='green.600' />
                                    <Text fontWeight='light'>{member.full_name}</Text>
                                </HStack>
                            </HStack>
                        </ListItem>
                    )
                })}

            </List>
        </Stack>
    )
}