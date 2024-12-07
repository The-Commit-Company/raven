import { SidebarHeader } from "./SidebarHeader";
import { SidebarBody } from "./SidebarBody";
import { Box, Flex, Separator } from "@radix-ui/themes";
import { HStack } from "../Stack";
import WorkspacesSidebar from "./WorkspacesSidebar";

export const Sidebar = () => {
    return (
        <HStack gap='0' className="h-screen">
            <WorkspacesSidebar />
            <Flex justify='between' direction='row' gap='2' width='100%'>
                <Flex direction='column' gap='2' width='100%'>
                    <SidebarHeader />
                    <Box px='2'>
                        <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                    </Box>
                    <SidebarBody />
                </Flex>
            </Flex>
        </HStack>

    )
}
