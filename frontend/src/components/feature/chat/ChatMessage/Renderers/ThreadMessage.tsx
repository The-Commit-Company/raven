import { Link, useParams } from "react-router-dom"
import { Message } from "../../../../../../../types/Messaging/Message"
import { Button, Flex, Text } from "@radix-ui/themes"
import { useFrappeGetCall } from "frappe-react-sdk"

export const ThreadMessage = ({ thread }: { thread: Message }) => {

    const { workspaceID } = useParams()

    return (
        <div className="mt-2">
            <Flex justify={'between'} align={'center'} gap='2' className="w-fit px-3 py-2 border border-gray-4 rounded-md shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)]">
                <ThreadReplyCount thread={thread} />
                <Button size={'1'}
                    asChild
                    color="gray"
                    variant={'ghost'}
                    className={'not-cal w-fit hover:bg-transparent hover:underline cursor-pointer'}>
                    <Link to={`/${workspaceID}/${thread.channel_id}/thread/${thread.name}`}>View Thread</Link>
                </Button>
            </Flex>
        </div>
    )
}

export const ThreadReplyCount = ({ thread }: { thread: Message }) => {

    const { data } = useFrappeGetCall<{ message: number }>("raven.api.threads.get_number_of_replies", {
        thread_id: thread.name
    }, ["thread_reply_count", thread.name], {
        revalidateOnFocus: false,
        shouldRetryOnError: false
    })

    return <Flex gap='1' align={'center'}>
        <Text size='1' className={'font-semibold text-accent-a11'}>{data?.message ?? 0}</Text>
        <Text size='1' className={'font-semibold text-accent-a11'}>{data?.message === 1 ? 'Reply' : 'Replies'}</Text>
    </Flex>
}