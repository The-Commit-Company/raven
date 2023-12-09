import { useTheme } from '@/ThemeProvider'
import { Flex, IconButton, Text } from '@radix-ui/themes'
import { BiMoon, BiSun } from 'react-icons/bi'

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
                <ColorModeToggleButton />
            </Flex>
        </header>
    )
}

const ColorModeToggleButton = () => {

    const { appearance, toggleTheme } = useTheme()

    return <Flex align='center' justify='center' pr='1'>
        <IconButton
            size='1'
            aria-label='Toggle theme'
            title='Toggle theme'
            color='gray'
            className='text-gray-11 hover:text-gray-12'
            variant='ghost'
            onClick={toggleTheme}>
            {appearance === 'light' ? <BiMoon /> : <BiSun />}
        </IconButton>
    </Flex>
}