import { PageHeader } from '@/components/layout/Heading/PageHeader'
import { Box, Flex, Heading } from '@radix-ui/themes'
import { BiChevronLeft } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import { SettingsSidebar } from './SettingsSidebar'
import { Outlet } from "react-router-dom"

const UserSettings = () => {
    return (
        <>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Settings</Heading>
                </Flex>
            </PageHeader>
            <Flex className="min-h-screen pt-16 w-full">
                <SettingsSidebar />
                <Box className="w-full">
                    <Outlet />
                </Box>
            </Flex>
        </>
    )
}

export const Component = UserSettings