import { useTheme } from '@/ThemeProvider'
import { commandMenuOpenAtom } from '@/components/feature/CommandMenu/CommandMenu'
import { Flex, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { BiMoon, BiSun } from 'react-icons/bi'
import { useSetAtom } from 'jotai'
import { TbSearch } from 'react-icons/tb'
import { __ } from '@/utils/translations'

export const SidebarHeader = () => {
    return (
        <header>
            <Flex
                justify='between'
                px='3'
                align='center'
                pt='1'
                height='48px'>
                <Text as='span' size='6' className='cal-sans pl-1'>raven</Text>
                <Flex align='center' gap='3' className='pr-1 sm:pr-0'>
                    <SearchButton />
                    <ColorModeToggleButton />
                </Flex>
            </Flex>
        </header>
    )
}

const SearchButton = () => {

    const setOpen = useSetAtom(commandMenuOpenAtom)

    return (
        <Tooltip content="⌘+K">
            <IconButton
                size={{ initial: '2', md: '1' }}
                aria-label='Open command menu'
                title={__("Open command menu")}
                color='gray'
                className='text-gray-11 sm:hover:text-gray-12'
                variant='ghost'
                onClick={() => setOpen(true)}
            >
                <TbSearch className='text-lg sm:text-base' />
            </IconButton>
        </Tooltip>
    )
}

const ColorModeToggleButton = () => {

    const { appearance, setAppearance } = useTheme()

    const toggleTheme = () => {
        if (appearance === 'light') {
            setAppearance('dark')
        } else {
            setAppearance('light')
        }
    }

    return <Flex align='center' justify='center' pr='1'>
        <IconButton
            size={{ initial: '2', md: '1' }}
            aria-label='Toggle theme'
            title={__("Toggle theme")}
            color='gray'
            className='text-gray-11 sm:hover:text-gray-12'
            variant='ghost'
            onClick={toggleTheme}>
            {appearance === 'light' ? <BiMoon className='text-lg sm:text-base' /> : <BiSun className='text-lg sm:text-base' />}
        </IconButton>
    </Flex>
}