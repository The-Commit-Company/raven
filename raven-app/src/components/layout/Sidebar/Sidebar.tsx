import { Divider, HStack, IconButton, useColorMode, Text, Stack, Avatar, AvatarBadge } from "@chakra-ui/react";
import { PropsWithChildren, useContext } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi"
import { FiEdit } from "react-icons/fi";
import { ChannelList } from "../../feature/channels/ChannelList";
import { UserDataContext } from "../../../utils/user/UserDataProvider"

export const Sidebar = ({ children }: PropsWithChildren<{}>) => {

    const { colorMode, toggleColorMode } = useColorMode()
    const userData = useContext(UserDataContext)

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
                <ChannelList />
            </Stack>

            <Stack>
                <Divider borderColor={colorMode === "light" ? "gray.300" : "gray.600"} />
                <HStack justifyContent={"space-between"} px='1'>
                    {userData &&
                        <HStack>
                            <Avatar size="xs" src={userData.user_image} name={userData.full_name} borderRadius='md'>
                                <AvatarBadge boxSize='1.0em' bg='green.500' />
                            </Avatar>
                            <Text fontSize="sm">{userData.full_name}</Text>
                        </HStack>
                    }
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
