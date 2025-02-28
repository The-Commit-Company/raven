import { useTheme } from '@/ThemeProvider'
import { commandMenuOpenAtom } from '@/components/feature/CommandMenu/CommandMenu'
import { Button, Flex, IconButton, Kbd, Text, Tooltip } from '@radix-ui/themes'
import { BiMoon, BiSun } from 'react-icons/bi'
import { useSetAtom } from 'jotai'
import { TbSearch } from 'react-icons/tb'
import { __ } from '@/utils/translations'
import { HStack } from '../Stack'
import { getKeyboardMetaKeyString } from '@/utils/layout/keyboardKey'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import MentionsButton from './MentionsButton'

export const SidebarHeader = () => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <header>
                <Flex
                    justify='between'
                    px='2'
                    align='center'
                    pt='2'
                >
                    <CommandMenuButton />
                    <MentionsButton />
                </Flex>
            </header>
        )
    }

    return (
        <header>
            <Flex
                justify='between'
                px='3'
                align='center'
                pt='1'
                height='48px'>
                <Text as='span' size='6' className='cal-sans pl-1'>raven</Text>
                <Flex align='center' gap='4' className='pr-1 sm:pr-0'>
                    <MentionsButton />
                    <SearchButton />
                    <ColorModeToggleButton />
                </Flex>
            </Flex>
        </header>
    )


}


const CommandMenuButton = () => {

    const setOpen = useSetAtom(commandMenuOpenAtom)

    return <Button
        onClick={() => setOpen(true)}
        aria-label='Open command menu'
        title={__("Open command menu")}
        className='bg-gray-3 hover:bg-gray-4 p-2 rounded-md flex justify-between items-center min-w-48 text-gray-11 sm:hover:text-gray-12'
        color='gray'
    >
        <HStack>
            <TbSearch className='text-lg sm:text-base' />
            <Text as='span' className='not-cal -mt-0.5' weight='regular'>Search</Text>
        </HStack>
        <Kbd className='dark:font-bold'>{getKeyboardMetaKeyString()}+K</Kbd>
    </Button>
}
/** Only used on mobile */
const SearchButton = () => {

    const setOpen = useSetAtom(commandMenuOpenAtom)

    return (
        <Tooltip content="Search">
            <IconButton
                size={{ initial: '2', md: '1' }}
                aria-label='Open command menu'
                title={__("Open command menu")}
                color='gray'
                className='text-gray-11 sm:hover:text-gray-12 p-2'
                variant='ghost'
                onClick={() => setOpen(true)}
            >
                <TbSearch className='text-lg sm:text-base' />
            </IconButton>
        </Tooltip>
    )
}

/** Only used on mobile */
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
            className='text-gray-11 sm:hover:text-gray-12 p-2'
            variant='ghost'
            onClick={toggleTheme}>
            {appearance === 'light' ? <BiMoon className='text-lg sm:text-base' /> : <BiSun className='text-lg sm:text-base' />}
        </IconButton>
    </Flex>
}