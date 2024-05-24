import { useTheme } from '@/ThemeProvider'
import { CommandList } from '@/components/feature/CommandMenu/CommandMenu'
import { Flex, IconButton, Text } from '@radix-ui/themes'
import { BiCommand, BiMoon, BiSun } from 'react-icons/bi'
import { Drawer, DrawerContent, DrawerTrigger } from '../Drawer'

export const SidebarHeader = () => {
    return (
        <header>
            <Flex
                justify='between'
                px='3'
                align='center'
                pt='1'
                height='8'>
                <Text as='span' size='6' className='cal-sans pl-1'>raven</Text>
                <Flex align='center' gap='4' className='pr-1 sm:pr-0'>
                    <SearchButton />
                    <ColorModeToggleButton />
                </Flex>
            </Flex>
        </header>
    )
}

const SearchButton = () => {

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <IconButton
                    size={{ initial: '2', md: '1' }}
                    aria-label='Open command menu'
                    title='Open command menu'
                    color='gray'
                    className='text-gray-11 sm:hover:text-gray-12 sm:hidden'
                    variant='ghost'
                >
                    <BiCommand className='text-lg' />
                </IconButton>
            </DrawerTrigger>
            <DrawerContent>
                <div className='min-h-[80vh]'>
                    <CommandList />
                </div>

            </DrawerContent>
        </Drawer>
    )
}

const ColorModeToggleButton = () => {

    const { appearance, toggleTheme } = useTheme()

    return <Flex align='center' justify='center' pr='1'>
        <IconButton
            size={{ initial: '2', md: '1' }}
            aria-label='Toggle theme'
            title='Toggle theme'
            color='gray'
            className='text-gray-11 sm:hover:text-gray-12'
            variant='ghost'
            onClick={toggleTheme}>
            {appearance === 'light' ? <BiMoon className='text-lg sm:text-base' /> : <BiSun className='text-lg sm:text-base' />}
        </IconButton>
    </Flex>
}