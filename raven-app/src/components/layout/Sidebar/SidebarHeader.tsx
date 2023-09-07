import { Stack, HStack, Tooltip, IconButton, Image, useColorModeValue, useColorMode } from '@chakra-ui/react'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import raven_logo_light from "../../../assets/raven_logo_light.png"
import raven_logo_dark from "../../../assets/raven_logo_dark.png"

export const SidebarHeader = () => {

    const logo = useColorModeValue(raven_logo_light, raven_logo_dark)

    return (
        <Stack px={1} w='full' h='48px'>
            <HStack justifyContent="space-between" pb='2' pt='4'>
                <Image src={logo} objectFit="contain" alt="Raven" height='16px' />
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