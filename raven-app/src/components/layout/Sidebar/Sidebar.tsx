import { Divider, HStack, IconButton, useColorMode, Text, Stack, Avatar } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi"
import { FiEdit } from "react-icons/fi";
import { SidebarGroup, SidebarGroupList, SidebarItem, SidebarItemLabel } from "./SidebarComp";

export const Sidebar = ({ children }: PropsWithChildren<{}>) => {

    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Stack justify={'space-between'} h='100vh'>
            <Stack>
                <HStack justifyContent="space-between" spacing="3" h='33px'>
                    <Text fontSize="xl" fontWeight="semibold" ml='3'>Raven</Text>
                    <IconButton
                        size={"sm"}
                        aria-label="Send message"
                        icon={<FiEdit />}
                    />
                </HStack>
                <Divider />

                <SidebarGroup>
                    <SidebarGroupList>
                        <SidebarItem to="channel">
                            <SidebarItemLabel>Channels</SidebarItemLabel>
                        </SidebarItem>
                        <SidebarItem to="message">
                            <SidebarItemLabel>Direct Messages</SidebarItemLabel>
                        </SidebarItem>
                    </SidebarGroupList>
                </SidebarGroup>
            </Stack>

            <Stack>
                <Divider borderColor={colorMode === "light" ? "gray.300" : "gray.600"} />
                <HStack justifyContent={"space-between"} px='1'>
                    <HStack>
                        <Avatar size="2xs" />
                        <Text fontSize="sm">User Name</Text>
                    </HStack>
                    <IconButton
                        size={"xs"}
                        aria-label="Toggle theme"
                        icon={colorMode === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
                        onClick={toggleColorMode}
                    />
                </HStack>
            </Stack>
        </Stack>
    )
}
