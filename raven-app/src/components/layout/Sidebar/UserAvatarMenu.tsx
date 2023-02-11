import { useContext } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { Menu, MenuList, MenuButton, Avatar, AvatarProps, MenuItem, MenuListProps, MenuGroup, MenuDivider, Box, Text, HStack, Icon } from '@chakra-ui/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { GoMail } from 'react-icons/go'

interface Props extends AvatarProps {
    menuListProps?: MenuListProps
}

export const UserAvatarMenu = ({ menuListProps, ...props }: Props) => {

    const { logout, currentUser } = useContext(UserContext)
    const { data } = useFrappeGetCall<{ message: { user_image: string, full_name: string } }>('frappe.client.get_value', {
        doctype: "User",
        fieldname: JSON.stringify(["user_image", "full_name"]),
        filters: { "name": currentUser }
    })

    return (
        <Menu>
            <MenuButton
                rounded={"full"}
                cursor="pointer"
            >
                <Avatar
                    size="xs"
                    name={data?.message.full_name ?? currentUser}
                    src={data?.message.user_image}
                    {...props}
                />
            </MenuButton>
            <MenuList fontSize="sm" {...menuListProps}>
                <Box px={3}>
                    <Text fontWeight='bold'>{data?.message.full_name}</Text>
                    <HStack mt={1}>
                        <Icon boxSize={4} as={GoMail} />
                        <Text fontSize="small" >{currentUser}</Text>
                    </HStack>
                </Box>
                <MenuDivider />
                <MenuItem onClick={logout}>Log Out</MenuItem>
            </MenuList>
        </Menu>
    )
}
