import { Stack, Divider, HStack, Avatar, AvatarBadge, Menu, Tooltip, MenuButton, IconButton, MenuList, MenuItem, Text, Link } from '@chakra-ui/react'
import { useContext } from 'react'
import { RxExit } from 'react-icons/rx'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'

type Props = {
    isUserActive: boolean
}

export const SidebarFooter = ({ isUserActive }: Props) => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)
    return (
        <Stack px='3' pt='2' zIndex='999' height={'50px'} bottom='0' pos='fixed' w='var(--sidebar-width)'>
            <Divider />
            <HStack justifyContent={"space-between"}>
                <HStack>
                    <Avatar size="xs" src={userData.user_image} name={userData.full_name} borderRadius='md'>
                        {isUserActive && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                    </Avatar>
                    <Text fontSize="sm">{userData.full_name}</Text>
                </HStack>
                <Menu>
                    <Tooltip hasArrow label='exit' placement='bottom' rounded={'md'}>
                        <MenuButton
                            as={IconButton}
                            aria-label="Exit Options"
                            icon={<RxExit />}
                            size="xs"
                        />
                    </Tooltip>
                    <MenuList fontSize="sm" zIndex={999}>
                        <MenuItem as={Link} href="/raven_mobile">Mobile App</MenuItem>
                        <MenuItem as={Link} href="/app">Desk Interface</MenuItem>
                        <MenuItem onClick={logout}>Log Out</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Stack>
    )
}