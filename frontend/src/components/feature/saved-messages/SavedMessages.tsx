import { useFrappeGetCall } from "frappe-react-sdk";
import { Link, useNavigate, useParams } from "react-router-dom"
import { Message } from "../../../../../types/Messaging/Message"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { EmptyStateForSavedMessages } from "@/components/layout/EmptyState/EmptyState";
import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { MessageBox } from "../GlobalSearch/MessageBox"
import { Box, Flex, Heading, Tabs } from "@radix-ui/themes";
import { BiChevronLeft } from "react-icons/bi";
import CompletedReminders from '../reminder/CompletedReminders'
import InProgressReminders from '../reminder/InProgressReminders'

const SavedMessages = () => {
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const { data, error } = useFrappeGetCall<{ message: (Message & { workspace?: string })[] }>("raven.api.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })

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

    const renderMessages = () => {
        if (!data?.message?.length) return <EmptyStateForSavedMessages />

        return (
            <Flex direction='column' gap='3' justify='start' px='4' py='3'>
                {data.message.map((message) => (
                    <MessageBox key={message.name} message={message} handleScrollToMessage={handleScrollToMessage} />
                ))}
            </Flex>
        )
    }

    return (
        <Flex direction='column' gap='0'>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to={`/${workspaceID}`} className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Saved</Heading>
                </Flex>
            </PageHeader>
            <div className="flex gap-0">
                <Box className="w-full sm:w-[50%] pt-12 border-r border-gray-4">
                    <ErrorBanner error={error} />
                    <Tabs.Root defaultValue="saved">
                        <Tabs.List className="px-4">
                            <Tabs.Trigger value="saved">Saved Messages</Tabs.Trigger>
                            <Tabs.Trigger value="inProgress">In Progress</Tabs.Trigger>
                            <Tabs.Trigger value="completed">Completed</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="saved" className="h-[calc(100vh-6rem)] overflow-y-auto">
                            {renderMessages()}
                        </Tabs.Content>
                        <Tabs.Content value="inProgress" className="h-[calc(100vh-6rem)] overflow-y-auto">
                            <InProgressReminders />
                        </Tabs.Content>
                        <Tabs.Content value="completed" className="h-[calc(100vh-6rem)] overflow-y-auto">
                            <CompletedReminders />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            </div>
        </Flex>
    )
}

export const Component = SavedMessages
