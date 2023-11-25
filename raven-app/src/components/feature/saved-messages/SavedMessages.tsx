import { Stack, Tooltip, Button, useDisclosure, Box } from "@chakra-ui/react"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useContext } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { TextMessage } from "../../../../../types/Messaging/Message"
import { VirtuosoRefContext } from "../../../utils/message/VirtuosoRefProvider"
import { ErrorBanner } from "../../layout/AlertBanner"
import { EmptyStateForSavedMessages } from "../../layout/EmptyState/EmptyState"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { CommandPalette } from "../command-palette"
import { MessageBox } from "../global-search/MessageBox"
import { Heading } from "@radix-ui/themes"
import { useToast } from "@/hooks/useToast"

interface SavedMessage extends TextMessage {
    channel_id: string,
    file: string
}

export const SavedMessages = () => {

    const navigate = useNavigate()

    const { toast } = useToast()

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const { isOpen: isCommandPaletteOpen, onClose: onCommandPaletteClose, onToggle: onCommandPaletteToggle } = useDisclosure()

    const { data, error } = useFrappeGetCall<{ message: SavedMessage[] }>("raven.raven_messaging.doctype.raven_message.raven_message.get_saved_messages", undefined, undefined, {
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
            }, 200)
        })
    }



    if (indexingError) {
        toast({
            description: "There was an error while indexing the message.",
            variant: "destructive",
            duration: 1000,
        })
    }
    if (error) {
        return <Box p={4}><ErrorBanner error={error} /></Box>
    }
    return (
        <>
            <PageHeader>
                <Heading size='5'>Saved</Heading>
                <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                    <Button
                        size={"sm"}
                        aria-label="search"
                        leftIcon={<Search size='16' />}
                        onClick={onCommandPaletteToggle}
                        fontWeight='light'>
                        Search
                    </Button>
                </Tooltip>
            </PageHeader>
            {data && data.message?.length === 0 && <EmptyStateForSavedMessages />}
            <Stack justify={'flex-start'} p={4} overflow='hidden' pt='20'>
                {data?.message?.map(({ name, text, owner, creation, channel_id, file, message_type }: SavedMessage) => {
                    return (
                        <MessageBox key={name} channelID={channel_id} messageName={name} creation={creation} owner={owner} messageText={text} file={file} message_type={message_type} handleScrollToMessage={handleScrollToMessage} />
                    )
                })}
            </Stack>
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={onCommandPaletteClose}
                onToggle={onCommandPaletteToggle} />
        </>
    )
}