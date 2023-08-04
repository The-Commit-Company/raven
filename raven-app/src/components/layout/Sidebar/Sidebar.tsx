import { Stack, StackDivider } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBody } from "./SidebarBody";

interface SidebarProps extends PropsWithChildren<{}> {
    isUserActive: boolean
}

export const Sidebar = ({ isUserActive }: SidebarProps) => {

    return (
        <Stack justifyContent={'space-between'} h='full' w='full'>
            <Stack px={2} divider={<StackDivider />}>
                <SidebarHeader />
                <SidebarBody />
            </Stack>
            <SidebarFooter isUserActive={isUserActive} />
        </Stack>
    )
}
