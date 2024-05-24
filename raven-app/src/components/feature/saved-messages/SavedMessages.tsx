import { useFrappeGetCall } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"
import { Message } from "../../../../../types/Messaging/Message"
import { ErrorBanner } from "../../layout/AlertBanner"
import { EmptyStateForSavedMessages } from "../../layout/EmptyState/EmptyState"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { MessageBox } from "../GlobalSearch/MessageBox"
import { Heading } from "@radix-ui/themes"
import { Box, Flex } from '@radix-ui/themes'

const SavedMessages = () => {

    const navigate = useNavigate()

    const { data, error } = useFrappeGetCall<{ message: Message[] }>("raven.api.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })

    const handleNavigateToChannel = (channelID: string, baseMessage?: string) => {
        navigate(`/channel/${channelID}`, {
            state: {
                baseMessage: baseMessage
            }
        })
    }

    const handleScrollToMessage = (messageName: string, channelID: string) => {
        handleNavigateToChannel(channelID, messageName)
    }

    return (
        <>
            <PageHeader>
                <Heading size='5'>Saved Messages</Heading>
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