import { SettingsSidebar } from '@/components/feature/userSettings/SettingsSidebar'
import { PageHeader } from '@/components/layout/Heading/PageHeader'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ChannelListProvider } from '@/utils/channel/ChannelListProvider'
import { __ } from '@/utils/translations'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { Box, Flex, Heading } from '@radix-ui/themes'
import clsx from 'clsx'
import { BiChevronLeft } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import { Outlet } from "react-router-dom"

const Settings = () => {
    const isDesktop = useIsDesktop()

    const lastWorkspace = localStorage.getItem('ravenLastWorkspace')
    const lastChannel = localStorage.getItem('ravenLastChannel')

    let path = '../'

    if (lastWorkspace && lastChannel) {
        path = `/${lastWorkspace}/${lastChannel}`
    } else if (lastWorkspace) {
        path = `/${lastWorkspace}`
    }


    return (
        <UserListProvider>
            <ChannelListProvider>
                <header className='dark:bg-gray-1 bg-white sticky top-0' style={{ zIndex: 999 }}>
                    <Box
                        py='3'
                        className={'border-gray-4 sm:dark:border-gray-4 border-b px-4 w-screen'}>
                        <Flex justify='between'>
                            <Flex align='center' gap='3' className="h-8">
                                <Link to={path} className="block bg-transparent hover:bg-transparent active:bg-transparent">
                                    <BiChevronLeft size='24' className="block text-gray-12" />
                                </Link>
                                <Heading size='5'>{__("Settings")}</Heading>
                            </Flex>
                        </Flex>
                    </Box>
                </header>
                <Flex className="w-full">
                    {isDesktop && <SettingsSidebar />}
                    <Box className="w-full ml-64">
                        <Outlet />
                    </Box>
                </Flex>
            </ChannelListProvider>
        </UserListProvider>
    )
}

export const Component = Settings