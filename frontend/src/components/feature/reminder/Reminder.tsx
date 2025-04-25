import { MessageContent } from "../chat/ChatMessage/MessageItem"
import { BsTrash } from "react-icons/bs"
import useCurrentRavenUser from "@/hooks/useCurrentRavenUser"
import { useGetUser } from "@/hooks/useGetUser"
import dayjs from "dayjs"
import { useFrappePostCall } from "frappe-react-sdk"
import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { useFrappeGetCall, useSWRConfig } from "frappe-react-sdk"
import { Message } from "../../../../../types/Messaging/Message"
import { Badge, Flex, Separator, Text } from "@radix-ui/themes"
import { toast } from "sonner"
import { QuickActionButton } from "../chat/ChatMessage/MessageActions/QuickActions/QuickActionButton"
import { BsCheck2, BsPencil } from "react-icons/bs"
import { MessageSenderAvatar, UserHoverCard } from "../chat/ChatMessage/MessageItem"


export interface Reminder {
    name: string
    remind_at: string
    description: string
    is_complete: boolean
    completed_at: string
    message_id: string
    channel_name: string
    is_direct_message: boolean
}

const Reminder = ({
    reminder,
    isCompleted = false,
    onEditClick
}: {
    reminder: Reminder,
    isCompleted?: boolean,
    onEditClick?: (reminder: Reminder) => void
}) => {
    const { mutate } = useSWRConfig()
    const { message_id, channel_name, remind_at, is_direct_message, name, description } = reminder

    const { deleteDoc } = useFrappeDeleteDoc()
    const { call: markComplete } = useFrappePostCall('raven.api.reminder.mark_as_complete')

    const getOverdueStatus = () => {
        const reminderTime = dayjs(remind_at)
        const currentTime = dayjs()
        const diffInMinutes = reminderTime.diff(currentTime, 'minute')

        if (diffInMinutes < 0) {
            return {
                status: 'overdue',
                text: `Overdue ${reminderTime.fromNow(true)}`
            }
        } else {
            return {
                status: 'upcoming',
                text: `Due ${reminderTime.fromNow()}`
            }
        }
    }

    const handleMarkComplete = async () => {
        markComplete({ reminder_id: name })
            .then(() => {
                toast.success('Reminder marked as complete')
                mutate("in_progress_reminders")
                mutate('reminders_count')
            })
            .catch((error) => {
                toast.error('Error marking reminder complete')
            })
    }

    const handleDelete = async () => {
        deleteDoc('Raven Reminder', name)
            .then(() => {
                toast.error('Reminder deleted')
                mutate("in_progress_reminders")
                mutate('reminders_count')
            })
            .catch((error) => {
                toast.error('Error deleting reminder')
            })
    }

    const status = getOverdueStatus()

    return (
        <Flex direction='column' gap='2' className="group relative hover:bg-gray-100 dark:hover:bg-gray-4 p-4">
            <Flex justify="between" align="center">
                <Flex gap='2' align="center">
                    {!isCompleted && (
                        <>
                            {status && (
                                <Badge color={status.status === 'overdue' ? 'red' : 'blue'}>
                                    {status.text}
                                </Badge>
                            )}
                            <Separator orientation='vertical' />
                        </>
                    )}
                    {channel_name ? <Text as='span' size='1'>{is_direct_message ? 'Direct Message' : '# ' + channel_name}</Text> : <Text as='span' size='1'>Reminder</Text>}
                </Flex>

                {!isCompleted && (
                    <Flex
                        gap='1' p="1"
                        className="absolute top-2 right-2 invisible group-hover:visible group-hover:transition-all ease-ease-out-quad group-hover:delay-100 shadow-md rounded-md bg-white dark:bg-gray-1"
                    >
                        <QuickActionButton
                            tooltip="Mark as complete"
                            onClick={handleMarkComplete}
                        >
                            <BsCheck2 size="15" />
                        </QuickActionButton>
                        <QuickActionButton
                            tooltip="Edit reminder"
                            onClick={() => onEditClick?.(reminder)}
                        >
                            <BsPencil size="15" />
                        </QuickActionButton>
                        <QuickActionButton
                            tooltip="Delete reminder"
                            onClick={handleDelete}
                        >
                            <BsTrash size="15" />
                        </QuickActionButton>
                    </Flex>
                )}
            </Flex>

            {message_id ? <ReminderWithMessage message_id={message_id} description={description} /> : <ReminderWithoutMessage description={description} />}
        </Flex>
    )
}

export default Reminder


const ReminderWithMessage = ({ message_id, description }: { message_id: string, description: string }) => {

    const { data } = useFrappeGetCall<{ message: Message }>("raven.api.raven_message.get_message", { message_id })

    const user = useGetUser(data?.message?.owner)

    return (
        <Flex gap='3'>
            <MessageSenderAvatar userID={data?.message?.owner ?? ""} user={user} isActive={false} />
            <Flex direction='column' gap='0' justify='center'>
                <UserHoverCard user={user} userID={data?.message?.owner ?? ""} isActive={false} />
                {data?.message && <MessageContent message={data?.message} user={user} />}
                <Text as='span' size='1' color='gray' className='pt-1'>{description}</Text>
            </Flex>
        </Flex>
    )
}

const ReminderWithoutMessage = ({ description }: { description: string }) => {

    const { myProfile: currentUser } = useCurrentRavenUser()

    const user = useGetUser(currentUser?.name)

    return (
        <Flex gap='3'>
            <MessageSenderAvatar userID={currentUser?.name ?? ""} user={user} isActive={false} />
            <Flex direction='column' gap='0' justify='center'>
                <UserHoverCard user={user} userID={currentUser?.name ?? ""} isActive={false} />
                <Text as='span' size='1' color='gray' className='pt-1'>{description}</Text>
            </Flex>
        </Flex>
    )
}