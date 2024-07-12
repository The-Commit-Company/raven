import { ErrorBanner } from "@/components/layout/AlertBanner"
import { EmptyStateForThreads } from "@/components/layout/EmptyState/EmptyState"
import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { Box, Flex, Heading } from "@radix-ui/themes"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiChevronLeft } from "react-icons/bi"
import { Link } from "react-router-dom"
import { ThreadPreviewBox } from "./ThreadPreviewBox"
import { RavenThread } from "@/types/RavenMessaging/RavenThread"

const Threads = () => {

    const { data, error } = useFrappeGetCall<{ message: RavenThread[] }>("raven.api.raven_thread.get_threads", undefined, undefined, {
        revalidateOnFocus: false
    })

    return (
        <>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Threads</Heading>
                </Flex>
            </PageHeader>
            <Box className="min-h-screen pt-16 pb-8">
                <ErrorBanner error={error} />
                {data && data.message?.length === 0 ?
                    <EmptyStateForThreads /> :
                    <Flex direction='column' gap='3' justify='start' px='4'>
                        {data && data.message.map((thread) => {
                            return <ThreadPreviewBox key={thread.name} thread={thread} />
                        })}
                    </Flex>}
            </Box>
        </>
    )
}

export const Component = Threads