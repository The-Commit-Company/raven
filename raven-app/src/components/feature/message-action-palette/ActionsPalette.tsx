import { ButtonGroup, IconButton, Link, Tooltip, useDisclosure } from '@chakra-ui/react'
import { BsDownload } from 'react-icons/bs'
import { RiDeleteBinLine, RiEdit2Line } from 'react-icons/ri'
import { DeleteMessageModal } from '../message-details/DeleteMessageModal'
import { EditMessageModal } from '../message-details/EditMessageModal'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { ChannelData } from '../../../types/Channel/Channel'
import { useContext } from 'react'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'

interface ActionButtonPaletteProps {
    name: string
    image?: string
    file?: string
    text?: string
    showButtons: {}
}

export const ActionsPalette = ({ name, image, file, text, showButtons }: ActionButtonPaletteProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    const { isOpen: isDeleteMessageModalOpen, onOpen: onDeleteMessageModalOpen, onClose: onDeleteMessageModalClose } = useDisclosure()
    const { isOpen: isEditMessageModalOpen, onOpen: onEditMessageModalOpen, onClose: onEditMessageModalClose } = useDisclosure()

    return (
        <>
            <ButtonGroup style={showButtons}>
                {image &&
                    <Tooltip hasArrow label='download' size='xs' placement='top'>
                        <IconButton
                            as={Link}
                            href={image}
                            isExternal
                            aria-label="download file"
                            icon={<BsDownload />}
                            size='xs' />
                    </Tooltip>
                }
                {file &&
                    <Tooltip hasArrow label='download' size='xs' placement='top'>
                        <IconButton
                            as={Link}
                            href={file}
                            isExternal
                            aria-label="download file"
                            icon={<BsDownload />}
                            size='xs' />
                    </Tooltip>
                }
                {text &&
                    <Tooltip hasArrow label='edit' size='xs' placement='top'>
                        <IconButton
                            onClick={onEditMessageModalOpen}
                            aria-label="edit message"
                            icon={<RiEdit2Line />}
                            size='xs' />
                    </Tooltip>
                }
                <Tooltip hasArrow label='delete' size='xs' placement='top'>
                    <IconButton
                        onClick={onDeleteMessageModalOpen}
                        aria-label="delete message"
                        icon={<RiDeleteBinLine />}
                        size='xs' />
                </Tooltip>
            </ButtonGroup>
            <DeleteMessageModal isOpen={isDeleteMessageModalOpen} onClose={onDeleteMessageModalClose} channelMessageID={name} />
            {text && <EditMessageModal isOpen={isEditMessageModalOpen} onClose={onEditMessageModalClose} channelMessageID={name} allMembers={allMembers} allChannels={allChannels ?? []} originalText={text} />}
        </>
    )
}