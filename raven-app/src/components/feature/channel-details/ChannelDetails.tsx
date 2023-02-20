import { Box, HStack, Stack, useColorMode, Text, Button, Divider } from "@chakra-ui/react"
import { useContext } from "react"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

export const ChannelDetails = () => {

    const { colorMode } = useColorMode()
    const { channelData } = useContext(ChannelContext)

    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    return (
        <Stack spacing='4'>
            <Box {...BOXSTYLE}>
                <HStack justifyContent='space-between' alignItems='self-start'>
                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Channel name</Text>
                        <HStack spacing={1}>
                            {channelData[0].type === 'Public' ? <BiHash /> : <BiLockAlt />}
                            <Text fontSize='sm'>{channelData[0].channel_name}</Text>
                        </HStack>
                    </Stack>
                    <Button colorScheme='blue' variant='link' size='sm'>Edit</Button>
                </HStack>
            </Box>
            <Box {...BOXSTYLE}>
                <Stack spacing='4'>

                    <HStack justifyContent='space-between' alignItems='self-start'>
                        <Stack>
                            <Text fontWeight='semibold' fontSize='sm'>Channel description</Text>
                            <Text fontSize='sm' color='gray.500'>
                                {channelData[0].channel_description ? channelData[0].channel_description : 'No description'}
                            </Text>
                        </Stack>
                        <Button colorScheme='blue' variant='link' size='sm'>
                            {channelData[0].channel_description ? 'Edit' : 'Add'}
                        </Button>
                    </HStack>

                    <Divider />

                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Created by</Text>
                        <HStack>
                            <Text fontSize='sm'>@{channelData[0].owner}</Text>
                            <Text fontSize='sm' color='gray.500'>on {channelData[0].creation}</Text>
                        </HStack>
                    </Stack>

                    <Divider />

                    <Button colorScheme='red' variant='link' size='sm' w='fit-content'>
                        Leave channel
                    </Button>

                </Stack>
            </Box>
        </Stack>
    )
}