import { Text, Stack, useToast, Tooltip, Button, useDisclosure, Box } from "@chakra-ui/react"
import { useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useContext } from "react"
import { HiOutlineSearch } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { ChannelData } from "../../../types/Channel/Channel"
import { TextMessage } from "../../../types/Messaging/Message"
import { User } from "../../../types/User/User"
import { VirtuosoRefContext } from "../../../utils/message/VirtuosoRefProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"
import { CommandPalette } from "../command-palette"
import { MessageBox } from "../global-search/MessageBox"

interface SavedMessage extends TextMessage {
    channel_id: string,
    file: string
}

export const SavedMessages = () => {

    const navigate = useNavigate()

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const { isOpen: isCommandPaletteOpen, onClose: onCommandPaletteClose, onToggle: onCommandPaletteToggle } = useDisclosure()

    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    }, undefined, {
        revalidateOnFocus: false
    })

    const { data, error } = useFrappeGetCall<{ message: SavedMessage[] }>("raven.raven_messaging.doctype.raven_message.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })
    const { data: channels, error: channelsError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list", undefined, undefined, {
        revalidateOnFocus: false
    })
    const { call, error: indexingError, reset } = useFrappePostCall<{ message: string }>("raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message")

    const handleNavigateToChannel = (channelID: string, _callback: VoidFunction) => {
        navigate(`/channel/${channelID}`)
        _callback()
    }

    const handleScrollToMessage = (messageName: string, channelID: string) => {
        reset()
        handleNavigateToChannel(channelID, async function () {
            const result = await call({
                channel_id: channelID,
                message_id: messageName
            })
            setTimeout(() => {
                if (virtuosoRef) {
                    virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center' })
                }
            }, 100)
        })
    }

    const toast = useToast()

    if (indexingError && !toast.isActive('message-indexing-error')) {
        toast({
            description: "There was an error while indexing the message.",
            status: "error",
            duration: 4000,
            size: 'sm',
            render: ({ onClose }) => <AlertBanner onClose={onClose} variant='solid' status='error' fontSize="sm">
                There was an error while indexing the message.<br />You have been redirected to the channel.
            </AlertBanner>,
            id: 'message-indexing-error',
            variant: 'left-accent',
            isClosable: true,
            position: 'bottom-right'
        })
    }
    if (error) {
        return (
            <Box p={4}>
                <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
            </Box>
        )
    }
    return (
        <>
            <PageHeader>
                <PageHeading>
                    <Text>Saved</Text>
                </PageHeading>
                <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                    <Button
                        size={"sm"}
                        aria-label="search"
                        leftIcon={<HiOutlineSearch />}
                        onClick={onCommandPaletteToggle}
                        fontWeight='light'>
                        Search
                    </Button>
                </Tooltip>
            </PageHeader>
            <Stack h='calc(100vh)' justify={'flex-start'} p={4} overflow='scroll' pt='20'>
                {data?.message?.map(({ name, text, owner, creation, channel_id, file, message_type }: SavedMessage) => {
                    const isArchived = channels?.message.find((channel: ChannelData) => channel.name === channel_id)?.is_archived
                    const channelName = channels?.message.find((channel: ChannelData) => channel.name === channel_id)?.channel_name
                    const full_name = users.find((user: User) => user.name === owner)?.full_name
                    const user_image = users.find((user: User) => user.name === owner)?.user_image
                    return (
                        <MessageBox isArchived={isArchived} channelName={channelName} messageName={name} channelID={channel_id} creation={creation} owner={owner} messageText={text} full_name={full_name} user_image={user_image} file={file} message_type={message_type} handleScrollToMessage={handleScrollToMessage} />
                    )
                }
                )}
            </Stack>
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={onCommandPaletteClose}
                onToggle={onCommandPaletteToggle} />
        </>
    )
}