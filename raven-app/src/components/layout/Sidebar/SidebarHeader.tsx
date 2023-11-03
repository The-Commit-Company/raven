import { useTheme } from '@/ThemeProvider'
import { Box, Flex, IconButton, Text } from '@radix-ui/themes'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'

export const SidebarHeader = () => {

    return (
        <Flex justify="between" px='3' align='center' height='8'>
            <Text as='span' size='6' className='cal-sans'>raven</Text>
            <ColorModeToggleButton />
        </Flex>
    )
}

const ColorModeToggleButton = () => {

    const { appearance, toggleTheme } = useTheme()
    return <Flex align='center' justify='center' pr='1'>
        <IconButton
            size={"1"}
            aria-label="Toggle theme"
            title='Toggle theme'
            color='gray'
            variant='ghost'
            onClick={toggleTheme}
        >
            {appearance === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
        </IconButton>
    </Flex>
}