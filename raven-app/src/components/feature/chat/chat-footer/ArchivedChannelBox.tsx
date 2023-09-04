import { Text, Box, Center, HStack, Stack, useColorMode } from "@chakra-ui/react"
import { BiHash } from "react-icons/bi"

interface ArchivedChannelBoxProps {
    channel_name: string
}

export const ArchivedChannelBox = ({ channel_name }: ArchivedChannelBoxProps) => {

    const { colorMode } = useColorMode()

    return (
        <Box>
            <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                <HStack justify='center' align='center' pb={4}>
                    <BiHash />
                    <Text>{channel_name}</Text>
                </HStack>
                <Center>
                    <Text>This channel has been archived.</Text>
                </Center>
            </Stack>
        </Box>
    )
}