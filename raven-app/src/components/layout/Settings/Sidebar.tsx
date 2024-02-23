import { Flex, Box, Separator } from "@radix-ui/themes"
import { SidebarBody } from "./SidebarBody"
import { SidebarFooter } from "../Sidebar/SidebarFooter"
import { SidebarHeader } from "./SidebarHeader"

export interface Props { }

/**
 * Sidebar for Settings page
 */
export const Sidebar = (props: Props) => {
    return (
        <Flex justify='between' direction='row' gap='2'>
            <Flex direction='column' gap='2' width='100%'>
                <SidebarHeader />
                <Box px='3'>
                    <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                </Box>
                <SidebarBody />
            </Flex>
            <SidebarFooter isSettingsPage />
        </Flex>
    )
}