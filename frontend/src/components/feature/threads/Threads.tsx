import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { Box, Flex, Heading, Tabs } from "@radix-ui/themes"
import { BiChevronLeft } from "react-icons/bi"
import { Link, Outlet, useParams } from "react-router-dom"
import ParticipatingThreads from "./ThreadManager/ParticipatingThreads"
import clsx from "clsx"
import AIThreads from "./ThreadManager/AIThreads"
import OtherThreads from "./ThreadManager/OtherThreads"

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
    workspace?: string,
    reply_count?: number
}

const Threads = () => {

    const { workspaceID, threadID } = useParams()

    return (
        <Flex direction='column' gap='0'>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to={`/${workspaceID}`} className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Threads</Heading>
                </Flex>
            </PageHeader>
            <div className="flex gap-0">
                <Box className={clsx("w-full sm:w-[50%] pt-12 border-r border-gray-4", threadID ? "hidden sm:block" : "block")}>
                    {/* Show only regular threads now since this needs pagination */}
                    <Tabs.Root defaultValue="Participating">
                        <Tabs.List className="px-4">
                            <Tabs.Trigger value="Participating">Participating</Tabs.Trigger>
                            <Tabs.Trigger value="Other">Other</Tabs.Trigger>
                            <Tabs.Trigger value="AI Threads">AI Agents</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="Participating">
                            <ParticipatingThreads />
                        </Tabs.Content>
                        <Tabs.Content value="Other" className="h-[calc(100vh-6rem)] overflow-y-auto">
                            <OtherThreads />
                        </Tabs.Content>
                        <Tabs.Content value="AI Threads" className="h-[calc(100vh-6rem)] overflow-y-auto">
                            <AIThreads />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
                <div className={clsx("h-screen w-full sm:w-[50%]", threadID ? "block" : "hidden")}>
                    <Outlet />
                </div>
            </div>
        </Flex>
    )
}

export const Component = Threads