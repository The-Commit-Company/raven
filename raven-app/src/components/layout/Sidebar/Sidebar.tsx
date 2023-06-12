import { Divider, HStack, IconButton, useColorMode, Text, Stack, Avatar, AvatarBadge, Menu, MenuButton, MenuList, MenuItem, Link } from "@chakra-ui/react";
import { PropsWithChildren, useContext } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi"
import { ChannelList } from "../../feature/channels/ChannelList";
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { DirectMessageList } from "../../feature/channels/DirectMessageList";
import { UserContext } from "../../../utils/auth/UserProvider";
import { RxExit } from "react-icons/rx";

interface SidebarProps extends PropsWithChildren<{}> {
    isUserActive: boolean
}

export const Sidebar = ({ isUserActive }: SidebarProps) => {

    const { colorMode, toggleColorMode } = useColorMode()
    const { logout } = useContext(UserContext)
    const userData = useContext(UserDataContext)

    return (
        <Stack>

            {/* header */}
            <Stack position={'fixed'} zIndex='999' h='57px' top='0' px={2} bgColor='gray.50' w='var(--sidebar-width)' borderBottom='1px solid' borderBottomColor={'gray.100'}>
                <HStack justifyContent="space-between" spacing="3" py='4'>
                    <Text fontSize="xl" fontWeight="semibold" ml={2}>Raven</Text>
                    <IconButton
                        size={"xs"}
                        aria-label="Toggle theme"
                        icon={colorMode === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
                        onClick={toggleColorMode}
                    />
                </HStack>

            </Stack>
            <Divider />
            {/* body */}
            <Stack px='2' pt='57px' pb='50px' overflowY='scroll'>
                <ChannelList />
                <DirectMessageList userData={userData} />
            </Stack>

            {/* footer */}
            <Stack pos='fixed' h='40px' bottom='0' bgColor='gray.50' w='var(--sidebar-width)'>
                <Divider borderColor={colorMode === "light" ? "gray.300" : "gray.600"} />
                <HStack justifyContent={"space-between"} px='3' pb='2'>
                    {userData &&
                        <HStack>
                            <Avatar size="xs" src={userData.user_image} name={userData.full_name} borderRadius='md'>
                                {isUserActive && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                            </Avatar>
                            <Text fontSize="sm">{userData.full_name}</Text>
                        </HStack>
                    }
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Exit Options"
                            icon={<RxExit />}
                            size="xs"
                        />
                        <MenuList fontSize="sm" zIndex={999}>
                            <MenuItem as={Link} href="/app">Desk Interface</MenuItem>
                            <MenuItem onClick={logout}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Stack>
        </Stack>
    )
}
