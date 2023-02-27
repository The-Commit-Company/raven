import { Box, HStack, Stack, useColorMode, Text, Button, Divider, useDisclosure } from "@chakra-ui/react"
import { useContext } from "react"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { AddOrEditChannelDescriptionModal } from "./EditChannelDetails/AddOrEditChannelDescriptionModal"
import { ChannelRenameModal } from "./EditChannelDetails/ChannelRenameModal"
import { LeaveChannelModal } from "./EditChannelDetails/LeaveChannelModal"

export const ChannelDetails = () => {

    const { colorMode } = useColorMode()
    const { channelData, channelMembers } = useContext(ChannelContext)
    const { currentUser } = useContext(UserContext)


    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    const { isOpen: isChannelRenameModalOpen, onOpen: onChannelRenameModalOpen, onClose: onChannelRenameModalClose } = useDisclosure()
    const { isOpen: isChannelDescriptionModalOpen, onOpen: onChannelDescriptionModalOpen, onClose: onChannelDescriptionModalClose } = useDisclosure()
    const { isOpen: isLeaveChannelModalOpen, onOpen: onLeaveChannelModalOpen, onClose: onLeaveChannelModalClose } = useDisclosure()

    return (
        <Stack spacing='4'>
            <Box {...BOXSTYLE}>
                <HStack justifyContent='space-between' alignItems='self-start'>
                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Channel name</Text>
                        <HStack spacing={1}>
                            {channelData[0].type === 'Private' ? <BiLockAlt /> : <BiHash />}
                            <Text fontSize='sm'>{channelData[0].channel_name}</Text>
                        </HStack>
                    </Stack>
                    <Button colorScheme='blue' variant='link' size='sm' onClick={onChannelRenameModalOpen}>Edit</Button>
                </HStack>
            </Box>
            <Box {...BOXSTYLE}>
                <Stack spacing='4'>

                    <HStack justifyContent='space-between' alignItems='self-start'>
                        <Stack>
                            <Text fontWeight='semibold' fontSize='sm'>Channel description</Text>
                            <Text fontSize='sm' color='gray.500'>
                                {channelData && channelData[0].channel_description && channelData[0].channel_description.length > 0 ? channelData[0].channel_description : 'No description'}
                            </Text>
                        </Stack>
                        <Button colorScheme='blue' variant='link' size='sm' onClick={onChannelDescriptionModalOpen}>
                            {channelData && channelData[0].channel_description && channelData[0].channel_description.length > 0 ? 'Edit' : 'Add'}
                        </Button>
                    </HStack>

                    <Divider />

                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Created by</Text>
                        <HStack>
                            {channelData[0].owner === 'Administrator'
                                ?
                                <Text fontSize='sm'>Administrator</Text>
                                :
                                channelData[0].owner && <Text fontSize='sm'>{channelMembers[channelData[0].owner].full_name}</Text>}
                            <Text fontSize='sm' color='gray.500'>on {DateObjectToFormattedDateString(new Date(channelData[0].creation))}</Text>
                        </HStack>
                    </Stack>


                    {channelMembers[currentUser] && channelData[0].type != 'Open' &&
                        <><Divider /><Button colorScheme='red' variant='link' size='sm' w='fit-content' onClick={onLeaveChannelModalOpen}>
                            Leave channel
                        </Button></>}

                </Stack>
            </Box>
            <ChannelRenameModal isOpen={isChannelRenameModalOpen} onClose={onChannelRenameModalClose} />
            <AddOrEditChannelDescriptionModal isOpen={isChannelDescriptionModalOpen} onClose={onChannelDescriptionModalClose} />
            <LeaveChannelModal isOpen={isLeaveChannelModalOpen} onClose={onLeaveChannelModalClose} />
        </Stack>
    )
}