import { Box, HStack, Stack, useColorMode, Text, Button, Divider, Icon } from "@chakra-ui/react"
import { useContext } from "react"
import { UserContext } from "../../../utils/auth/UserProvider"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { AddOrEditChannelDescriptionModal } from "./EditChannelDetails/AddOrEditChannelDescriptionModal"
import { ChannelRenameModal } from "./EditChannelDetails/ChannelRenameModal"
import { LeaveChannelModal } from "./EditChannelDetails/LeaveChannelModal"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/pages/ChatSpace"
import { getChannelIcon } from "@/utils/layout/channelIcon"

interface ChannelDetailsProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    onClose: () => void
}

export const ChannelDetails = ({ channelData, channelMembers, onClose }: ChannelDetailsProps) => {

    const { colorMode } = useColorMode()
    const { currentUser } = useContext(UserContext)

    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    const modalManager = useModalManager()

    const onChannelRenameModalOpen = () => {
        modalManager.openModal(ModalTypes.RenameChannel)
    }

    const onChannelDescriptionModalOpen = () => {
        modalManager.openModal(ModalTypes.EditChannelDescription)
    }

    const onLeaveChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.LeaveChannel)
    }

    const admin = Object.values(channelMembers).find(user => user.is_admin === 1)

    return (
        <Stack spacing='4'>

            <Box {...BOXSTYLE}>
                <HStack justifyContent='space-between' alignItems='self-start'>
                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Channel name</Text>
                        <HStack spacing={1}>
                            <Icon as={getChannelIcon(channelData?.type)} />
                            <Text fontSize='sm'>{channelData?.channel_name}</Text>
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
                                {channelData && channelData.channel_description && channelData.channel_description.length > 0 ? channelData.channel_description : 'No description'}
                            </Text>
                        </Stack>
                        <Button colorScheme='blue' variant='link' size='sm' onClick={onChannelDescriptionModalOpen}>
                            {channelData && channelData.channel_description && channelData.channel_description.length > 0 ? 'Edit' : 'Add'}
                        </Button>
                    </HStack>

                    <Divider />

                    <Stack>
                        <Text fontWeight='semibold' fontSize='sm'>Created by</Text>
                        <HStack>
                            {channelData?.owner === 'Administrator'
                                ?
                                <Text fontSize='sm'>Administrator</Text>
                                :
                                channelData?.owner && <Text fontSize='sm'>{channelMembers[channelData.owner]?.full_name}</Text>}
                            <Text fontSize='sm' color='gray.500'>on {DateObjectToFormattedDateString(new Date(channelData?.creation ?? ''))}</Text>
                        </HStack>
                    </Stack>

                    {channelData?.type != 'Open' && <>
                        <Divider />
                        <Stack>
                            <Text fontWeight='semibold' fontSize='sm'>Administrator</Text>
                            <HStack>
                                {admin ? <Text fontSize='sm'>{admin.full_name}</Text> :
                                    <Text fontSize='sm' color='gray.500'>No administrator</Text>}
                            </HStack>
                        </Stack>
                    </>}

                    {channelMembers[currentUser] && channelData?.type != 'Open' &&
                        <>
                            <Divider />
                            <Button colorScheme='red' variant='link' size='sm' w='fit-content' onClick={onLeaveChannelModalOpen}>
                                Leave channel
                            </Button>
                        </>
                    }

                </Stack>
            </Box>
            <ChannelRenameModal
                isOpen={modalManager.modalType === ModalTypes.RenameChannel}
                onClose={modalManager.closeModal}
                channelID={channelData.name}
                channel_name={channelData.channel_name}
                type={channelData.type} />
            <AddOrEditChannelDescriptionModal
                isOpen={modalManager.modalType === ModalTypes.EditChannelDescription}
                onClose={modalManager.closeModal}
                channelData={channelData} />
            <LeaveChannelModal
                isOpen={modalManager.modalType === ModalTypes.LeaveChannel}
                onClose={modalManager.closeModal}
                closeDetailsModal={onClose}
                channelData={channelData} />
        </Stack>
    )
}