import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBody } from "./SidebarBody";
import { Box, Flex, Separator } from "@radix-ui/themes";

export const Sidebar = () => {
    return (
        <Flex justify='between' direction='row' gap='2'>
            <Flex direction='column' gap='2' width='100%'>
                <SidebarHeader />
                <Box px='3'>
                    <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                </Box>
                <SidebarBody />
            </Flex>
            <SidebarFooter />
        </Flex>
    )
}
