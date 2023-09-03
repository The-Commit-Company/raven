import { Box, Stack, useColorMode, Divider, Button, Icon } from "@chakra-ui/react"
import { BsTrash, BsArchive } from "react-icons/bs"
import { ChangeChannelType } from "./ChangeChannelType"
import { ArchiveChannel } from "./ArchiveChannel"
import { DeleteChannel } from "./DeleteChannel"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { BiHash, BiLockAlt } from "react-icons/bi"

type Props = {
    onClose: () => void
    channelData: ChannelListItem
}

export const ChannelSettings = ({ onClose, channelData }: Props) => {

    const modalManager = useModalManager()

    const onDeleteChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.DeleteChannel)
    }

    const onArchiveChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.ArchiveChannel)
    }

    const onChannelTypeChangeModalOpen = () => {
        modalManager.openModal(ModalTypes.ChangeChannelType)
    }

    const { colorMode } = useColorMode()

    const BOXSTYLE = {
        p: '0',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    const BUTTONSTYLE = {
        variant: 'link',
        size: 'sm',
        p: '4',
        justifyContent: 'flex-start',
        _hover: {
            bg: colorMode === 'light' ? 'gray.50' : 'gray.800'
        },
        rounded: 'none'
    }

    return (
        <Stack spacing='4'>
            <Box {...BOXSTYLE}>
                <Stack spacing='0'>
                    <Button {...BUTTONSTYLE}
                        leftIcon={channelData.type === 'Public' ? <Icon as={BiLockAlt} /> : <Icon as={BiHash} />}
                        colorScheme="black"
                        onClick={onChannelTypeChangeModalOpen}>
                        Change to a {channelData.type === 'Public' ? 'private' : 'public'} channel
                    </Button>
                    <Divider />
                    <Button {...BUTTONSTYLE}
                        leftIcon={<BsArchive />}
                        colorScheme="red"
                        onClick={onArchiveChannelModalOpen}>
                        Archive channel
                    </Button><Divider /><Button {...BUTTONSTYLE}
                        leftIcon={<BsTrash fontSize={'1rem'} />}
                        colorScheme="red"
                        onClick={onDeleteChannelModalOpen}>
                        Delete channel
                    </Button>
                </Stack>
            </Box>
            <ChangeChannelType
                isOpen={modalManager.modalType === ModalTypes.ChangeChannelType}
                onClose={modalManager.closeModal}
                channelData={channelData} />
            <ArchiveChannel
                isOpen={modalManager.modalType === ModalTypes.ArchiveChannel}
                onClose={modalManager.closeModal}
                onCloseViewDetails={onClose}
                channelData={channelData} />
            <DeleteChannel
                isOpen={modalManager.modalType === ModalTypes.DeleteChannel}
                onClose={modalManager.closeModal}
                channelData={channelData} />
        </Stack>
    )
}