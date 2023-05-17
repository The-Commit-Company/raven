import { Box, Stack, useColorMode, Divider, Button, useDisclosure } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { BsTrash, BsArchive } from "react-icons/bs"
import { ChangeChannelType } from "./ChangeChannelType"
import { ArchiveChannel } from "./ArchiveChannel"
import { DeleteChannel } from "./DeleteChannel"

type Props = {
    onClose: () => void
}

export const ChannelSettings = ({ onClose }: Props) => {

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

    const { isOpen: isChannelTypeChangeModalOpen, onOpen: onChannelTypeChangeModalOpen, onClose: onChannelTypeChangeModalClose } = useDisclosure()
    const { isOpen: isArchiveChannelModalOpen, onOpen: onArchiveChannelModalOpen, onClose: onArchiveChannelModalClose } = useDisclosure()
    const { isOpen: isDeleteChannelModalOpen, onOpen: onDeleteChannelModalOpen, onClose: onDeleteChannelModalClose } = useDisclosure()

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
            <ChangeChannelType isOpen={isChannelTypeChangeModalOpen} onClose={onChannelTypeChangeModalClose} />
            <ArchiveChannel isOpen={isArchiveChannelModalOpen} onClose={onArchiveChannelModalClose} onCloseViewDetails={onClose} />
            <DeleteChannel isOpen={isDeleteChannelModalOpen} onClose={onDeleteChannelModalClose} />
        </Stack>
    )
}