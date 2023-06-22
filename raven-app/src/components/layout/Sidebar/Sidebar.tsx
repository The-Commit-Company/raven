import { Divider, HStack, IconButton, useColorMode, Text, Stack, Avatar, AvatarBadge, Menu, MenuButton, MenuList, MenuItem, Link, Image, Tooltip } from "@chakra-ui/react";
import { PropsWithChildren, useContext } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi"
import { ChannelList } from "../../feature/channels/ChannelList";
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { DirectMessageList } from "../../feature/channels/DirectMessageList";
import { UserContext } from "../../../utils/auth/UserProvider";
import { RxExit } from "react-icons/rx";
import raven_logo_light from "../../../assets/raven_logo_light.png"
import raven_logo_dark from "../../../assets/raven_logo_dark.png"
import { SidebarGroupLabel, SidebarIcon, SidebarItem, SidebarItemLabel } from "./SidebarComp";
import { IoBookmarkOutline } from "react-icons/io5";

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
            <Stack position={'fixed'} zIndex='999' top='0' px={4} w='var(--sidebar-width)' bgColor={colorMode === 'light' ? 'gray.50' : 'black'}>
                <HStack justifyContent="space-between" pb='2' pt='4'>
                    <Image src={colorMode === "light" ? raven_logo_light : raven_logo_dark} objectFit="contain" alt="Raven" height='16px' />
                    <Tooltip hasArrow label='toggle theme' placement='bottom' rounded={'md'}>
                        <IconButton
                            size={"xs"}
                            aria-label="Toggle theme"
                            icon={colorMode === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
                            onClick={toggleColorMode}
                        />
                    </Tooltip>
                </HStack>
                <Divider />
            </Stack>

            {/* body */}
            <Stack px='2' pt='57px' pb='50px' overflowY='scroll'>
                <SidebarItem to={'saved-messages'}>
                    <SidebarIcon><IoBookmarkOutline /></SidebarIcon>
                    <SidebarGroupLabel pl='1'>Saved Messages</SidebarGroupLabel>
                </SidebarItem>
                <ChannelList />
                <DirectMessageList userData={userData} />
            </Stack>

            {/* footer */}
            <Stack pos='fixed' px='3' pt='2' height={'50px'} bottom='0' bgColor={colorMode === 'light' ? 'gray.50' : 'black'} w='var(--sidebar-width)'>
                <Divider />
                <HStack justifyContent={"space-between"}>
                    {userData &&
                        <HStack>
                            <Avatar size="xs" src={userData.user_image} name={userData.full_name} borderRadius='md'>
                                {isUserActive && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                            </Avatar>
                            <Text fontSize="sm">{userData.full_name}</Text>
                        </HStack>
                    }
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
                            <MenuItem as={Link} href="/app">Desk Interface</MenuItem>
                            <MenuItem onClick={logout}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Stack>
        </Stack>
    )
}
