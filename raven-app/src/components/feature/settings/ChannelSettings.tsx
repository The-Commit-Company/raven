import { Box, Stack, useColorMode, Divider, Button } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { BsTrash, BsArchive } from "react-icons/bs"
import { ChangeChannelType } from "./ChangeChannelType"
import { ArchiveChannel } from "./ArchiveChannel"
import { DeleteChannel } from "./DeleteChannel"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"

type Props = {
    onClose: () => void
}

export const ChannelSettings = ({ onClose }: Props) => {

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
    const { channelData } = useContext(ChannelContext)

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
                    {channelData?.type === 'Private' && <Button {...BUTTONSTYLE}
                        leftIcon={<BiHash fontSize={'1rem'} />}
                        colorScheme="black"
                        onClick={onChannelTypeChangeModalOpen}>
                        Change to a public channel
                    </Button>}
                    {channelData?.type === 'Public' && <Button {...BUTTONSTYLE}
                        leftIcon={<BiLockAlt fontSize={'1rem'} />}
                        colorScheme="black"
                        onClick={onChannelTypeChangeModalOpen}>
                        Change to a private channel
                    </Button>}
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
                onClose={modalManager.closeModal} />
            <ArchiveChannel
                isOpen={modalManager.modalType === ModalTypes.ArchiveChannel}
                onClose={modalManager.closeModal}
                onCloseViewDetails={onClose} />
            <DeleteChannel
                isOpen={modalManager.modalType === ModalTypes.DeleteChannel}
                onClose={modalManager.closeModal} />
        </Stack>
    )
}