import { useFrappeGetCall } from "frappe-react-sdk"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Message } from "../../../../../types/Messaging/Message"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { EmptyStateForSavedMessages } from "@/components/layout/EmptyState/EmptyState"
import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { MessageBox } from "../GlobalSearch/MessageBox"
import { Heading } from "@radix-ui/themes"
import { Box, Flex } from '@radix-ui/themes'
import { BiChevronLeft } from "react-icons/bi"

const SavedMessages = () => {

    const navigate = useNavigate()

    const { data, error } = useFrappeGetCall<{ message: (Message & { workspace?: string })[] }>("raven.api.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })

    const { workspaceID } = useParams()

    const handleNavigateToChannel = (channelID: string, workspace?: string, baseMessage?: string) => {
        let baseRoute = ''
        if (workspace) {
            baseRoute = `/${workspace}`
        } else {
            baseRoute = `/${workspaceID}`
        }

        navigate({
            pathname: `${baseRoute}/${channelID}`,
            search: `message_id=${baseMessage}`
        })
    }

    const handleScrollToMessage = (messageName: string, channelID: string, workspace?: string) => {
        handleNavigateToChannel(channelID, workspace, messageName)
    }

    return (
        <>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Saved Messages</Heading>
                </Flex>
            </PageHeader>
            <Box className="min-h-screen pt-16 pb-8">
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