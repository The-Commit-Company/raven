import { Stack, HStack, Tooltip, IconButton, useColorMode } from '@chakra-ui/react'
import { Text } from '@radix-ui/themes'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'

export const SidebarHeader = () => {

    return (
        <Stack px={1} w='full' h='48px'>
            <HStack justifyContent="space-between" pb='2' pt='2'>
                <Text as='span' size='6' className='cal-sans'>raven</Text>
                <ColorModeToggleButton />
            </HStack>
        </Stack>
    )
}

const ColorModeToggleButton = () => {

    const { colorMode, toggleColorMode } = useColorMode()
    return <Tooltip hasArrow label='toggle theme' placement='bottom' rounded={'md'}>
        <IconButton
            size={"xs"}
            aria-label="Toggle theme"
            icon={colorMode === "light" ? <HiOutlineMoon /> : <HiOutlineSun />}
            onClick={toggleColorMode}
        />
    </Tooltip>
}