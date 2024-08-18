import { ErrorBanner } from "@/components/layout/AlertBanner"
import { EmptyStateForThreads } from "@/components/layout/EmptyState/EmptyState"
import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { Box, Flex, Heading } from "@radix-ui/themes"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiChevronLeft } from "react-icons/bi"
import { Link } from "react-router-dom"
import { ThreadPreviewBox } from "./ThreadPreviewBox"

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
}

const Threads = () => {

    const { data, error } = useFrappeGetCall<{ message: ThreadMessage[] }>("raven.api.threads.get_all_threads", {
        revalidateOnFocus: false
    })

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
            <Box className="min-h-screen w-full pt-16 pb-8">
                <div className={'px-2'}><ErrorBanner error={error} /></div>
                {data && <>
                    {data.message?.length === 0 ?
                        <EmptyStateForThreads /> :
                        <Flex direction='column' gap='3' justify='start' px='4' pt='2'>
                            {data.message.map((thread) => {
                                return <ThreadPreviewBox key={thread.name} thread={thread} />
                            })}
                        </Flex>}
                </>}
            </Box>
        </Flex>
    )
}

export const Component = Threads