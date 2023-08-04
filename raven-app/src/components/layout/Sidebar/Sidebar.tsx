import { Stack, StackDivider } from "@chakra-ui/react";
import { PropsWithChildren, useContext } from "react";
import { ChannelList } from "../../feature/channels/ChannelList";
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { DirectMessageList } from "../../feature/channels/DirectMessageList";
import { SidebarGroupLabel, SidebarIcon, SidebarItem } from "./SidebarComp";
import { IoBookmarkOutline } from "react-icons/io5";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps extends PropsWithChildren<{}> {
    isUserActive: boolean
}

export const Sidebar = ({ isUserActive }: SidebarProps) => {
    const userData = useContext(UserDataContext)

    return (
        <Stack justifyContent={'space-between'} h='full' w='full'>
            <Stack px={2} divider={<StackDivider />}>
                <SidebarHeader />
                <Stack overflowY='scroll' h={'calc(100vh - 120px)'} px={-2}>
                    <SidebarItem to={'saved-messages'}>
                        <SidebarIcon><IoBookmarkOutline /></SidebarIcon>
                        <SidebarGroupLabel pl='1'>Saved Messages</SidebarGroupLabel>
                    </SidebarItem>
                    <ChannelList />
                    <DirectMessageList userData={userData} />
                </Stack>
            </Stack>
            <SidebarFooter isUserActive={isUserActive} />
        </Stack>
    )
}
