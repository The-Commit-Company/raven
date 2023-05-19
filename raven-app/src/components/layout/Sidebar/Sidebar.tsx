import { Divider, HStack, IconButton, useColorMode, Text, Stack, Avatar, AvatarBadge, Menu, MenuButton, MenuList, MenuItem, Link } from "@chakra-ui/react";
import { PropsWithChildren, useContext } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi"
import { ChannelList } from "../../feature/channels/ChannelList";
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { DirectMessageList } from "../../feature/channels/DirectMessageList";
import { UserContext } from "../../../utils/auth/UserProvider";
import { RxExit } from "react-icons/rx";
import { SidebarIcon, SidebarItem, SidebarItemLabel } from "./SidebarComp";
import { VscSettings } from "react-icons/vsc";

interface SidebarProps extends PropsWithChildren<{}> {
    isUserActive: boolean
}

export const Sidebar = ({ isUserActive }: SidebarProps) => {

    const { colorMode, toggleColorMode } = useColorMode()
    const { logout } = useContext(UserContext)
    const userData = useContext(UserDataContext)

    return (
        <Stack justify={'space-between'} h='100vh'>
            <Stack>
                <HStack justifyContent="space-between" spacing="3" h='33px'>
                    <Text fontSize="xl" fontWeight="semibold" ml='3'>Raven</Text>
                    <IconButton
                        size={"xs"}
                        aria-label="Toggle theme"
                        icon={colorMode === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
                        onClick={toggleColorMode}
                    />
                </HStack>
                <Divider />
                <ChannelList />
                <DirectMessageList userData={userData} />
                <SidebarItem to={"settings"}>
                    <SidebarIcon><VscSettings /></SidebarIcon>
                    <SidebarItemLabel>Settings</SidebarItemLabel>
                </SidebarItem>
            </Stack>

            <Stack>
                <Divider borderColor={colorMode === "light" ? "gray.300" : "gray.600"} />
                <HStack justifyContent={"space-between"} px='1'>
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
