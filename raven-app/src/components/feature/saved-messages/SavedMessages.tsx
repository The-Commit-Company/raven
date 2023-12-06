import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Message, TextMessage } from "../../../../../types/Messaging/Message"
import { VirtuosoRefContext } from "../../../utils/message/VirtuosoRefProvider"
import { ErrorBanner } from "../../layout/AlertBanner"
import { EmptyStateForSavedMessages } from "../../layout/EmptyState/EmptyState"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { MessageBox } from "../GlobalSearch/MessageBox"
import { Heading } from "@radix-ui/themes"
import { useToast } from "@/hooks/useToast"
import { SearchButton } from "../chat-header/SearchButton"
import { Box, Flex } from '@radix-ui/themes'

const SavedMessages = () => {

    const navigate = useNavigate()

    const { toast } = useToast()

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const { data, error } = useFrappeGetCall<{ message: Message[] }>("raven.raven_messaging.doctype.raven_message.raven_message.get_saved_messages", undefined, undefined, {
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
            }).catch(() => {
                toast({
                    description: "There was an error while indexing the message.",
                    variant: "destructive",
                    duration: 1000,
                })
            })
            if (result) {
                setTimeout(() => {
                    if (virtuosoRef) {
                        virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center' })
                    }
                }, 200)
            }
        })
    }

    return (
        <>
            <PageHeader>
                <Heading size='5'>Saved Messages</Heading>
                <SearchButton />
            </PageHeader>
            <Box className="min-h-screen pt-20 pb-8">
                <ErrorBanner error={error} />
                {data && data.message?.length === 0 && <EmptyStateForSavedMessages />}
                <Flex direction='column' gap='3' justify='start' px='4'>
                    {data?.message?.map((message) => {
                        return (
                            <MessageBox key={message.name} message={message} handleScrollToMessage={handleScrollToMessage} />
                        )
                    })}
                </Flex>
            </Box>

        </>
    )
}

export const Component = SavedMessages