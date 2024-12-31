import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { Box, Flex, Heading } from "@radix-ui/themes"
import { BiChevronLeft } from "react-icons/bi"
import { Link } from "react-router-dom"
import ThreadsList from "./ThreadsList"

export type ThreadMessage = {
    bot: string,
    channel_id: string,
    content: string,
    creation: string,
    file: string,
    hide_link_preview: 0 | 1,
    image_height: string
    image_width: string,
    is_bot_message: 0 | 1,
    last_message_details: string,
    last_message_timestamp: string,
    link_doctype: string,
    link_document: string,
    message_type: "Text" | "Image" | "File" | "Poll",
    name: string,
    owner: string,
    poll_id: string,
    text: string,
    thread_message_id: string,
    participants: { user_id: string }[],
    workspace?: string
}

const Threads = () => {

    return (
        <Flex direction='column' gap='0'>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Threads</Heading>
                </Flex>
            </PageHeader>
            <Box className="min-h-screen w-full pt-16 pb-8 px-4">
                <ThreadsList />
                {/* Show only regular threads now since this needs pagination */}
                {/* <Tabs.Root defaultValue="Threads">
                    <Tabs.List>
                        <Tabs.Trigger value="Threads">My Threads</Tabs.Trigger>
                        <Tabs.Trigger value="AI Threads">AI Threads</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="Threads">
                        <ThreadsList />
                    </Tabs.Content>
                    <Tabs.Content value="AI Threads">
                        <ThreadsList aiThreads={1} />
                    </Tabs.Content>
                </Tabs.Root> */}
            </Box>
        </Flex>
    )
}

export const Component = Threads