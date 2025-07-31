import { View } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme'
import { useFrappeDeleteDoc, useFrappeGetDoc } from 'frappe-react-sdk'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useSWRConfig } from 'frappe-react-sdk'
import dayjs from 'dayjs'
import { toast } from 'sonner-native'
import { Text } from '@components/nativewindui/Text'
import { BaseMessageItem } from '../chat-stream/BaseMessageItem'
import ErrorBanner from '@components/common/ErrorBanner'
import { Button } from '@components/nativewindui/Button'
import ClockIcon from '@assets/icons/ClockIcon.svg'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import UserAvatar from '@components/layout/UserAvatar'
import TrashIcon from '@assets/icons/TrashIcon.svg'
import { Link } from 'expo-router';

export interface Reminder {
    name: string
    remind_at: string
    description: string
    is_complete: boolean
    completed_at: string
    message_id: string
    channel_name: string
    is_direct_message: boolean
    creation: string
}

const ReminderItem = ({
    reminder,
    isCompleted = false,
}: {
    reminder: Reminder,
    isCompleted?: boolean,
}) => {

    const { message_id, channel_name, remind_at, is_direct_message, name, description } = reminder


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

    const status = getOverdueStatus()

    return (
        <View className='pt-2'>
            <View className='flex flex-row justify-between items-center px-3'>
                <View className='flex flex-row items-center gap-2.5'>
                    <Text className='text-sm text-foreground'>
                        {channel_name ? (is_direct_message ? 'Direct Message' : '# ' + channel_name) : 'Reminder'}
                    </Text>
                    {!isCompleted ? (
                        <>
                            <Text className='text-sm text-muted'>|</Text>
                            <Text className={`text-sm font-medium ${status.status === 'overdue' ? 'text-red-700' : 'text-muted-foreground'}`}>
                                {status.text}
                            </Text>
                        </>
                    ) : null}
                </View>

                <Text className='text-xs text-muted-foreground'>{dayjs(reminder.creation).fromNow()}</Text>
            </View>

            {message_id ? <ReminderWithMessage reminder={reminder} isCompleted={isCompleted} /> : <ReminderWithoutMessage reminder={reminder} isCompleted={isCompleted} />}
        </View>
    )
}

export default ReminderItem

const ReminderActions = ({ reminder, isCompleted }: { reminder: Reminder, isCompleted: boolean }) => {
    const { colors } = useColorScheme()
    const { mutate } = useSWRConfig()
    const { call: markComplete } = useFrappePostCall('raven.api.reminder.mark_as_complete')

    const { deleteDoc } = useFrappeDeleteDoc()

    const handleMarkComplete = async () => {
        markComplete({ reminder_id: reminder.name })
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
        deleteDoc('Raven Reminder', reminder.name)
            .then(() => {
                toast.success('Reminder deleted')
                mutate("in_progress_reminders")
            })
            .catch((error) => {
                toast.error('Error deleting reminder')
            })
    }

    if (isCompleted) return null;

    return (
        <View className='flex flex-row gap-1.5'>
            <Button
                onPress={handleMarkComplete}
                hitSlop={10}
                className='rounded-lg bg-primary/10 dark:bg-primary/20'
                size="sm"
            >
                <Text className='text-sm px-3 py-0.5 text-primary font-medium'>Mark as complete</Text>
            </Button>
            <Link asChild href={`./new-reminder?reminder=${encodeURIComponent(JSON.stringify(reminder))}`}>
                <Button
                    hitSlop={10}
                    className='rounded-lg bg-primary/10 dark:bg-primary/20'
                    size="sm"
                >
                    <ClockIcon width={16} height={16} fill={colors.primary} />
                </Button>
            </Link>
            <Button
                onPress={handleDelete}
                hitSlop={10}
                className='rounded-lg bg-destructive/10 dark:bg-destructive/20'
                size="sm"
            >
                <TrashIcon width={16} height={16} fill={colors.destructive} />
            </Button>
        </View>
    )
}

const ReminderWithMessage = ({ reminder, isCompleted }: { reminder: Reminder, isCompleted: boolean }) => {
    const { message_id, description, name } = reminder
    const { data: message, error } = useFrappeGetDoc('Raven Message', message_id)

    if (error) {
        return <View className='p-3'>
            <ErrorBanner error={error} />
        </View>
    }

    return (
        <View>
            {message && <BaseMessageItem message={message} />}
            <View className='pl-12'>
                <View className='px-4 flex gap-2 pt-1'>
                    {description && <Text className='text-sm text-muted-foreground'>{description}</Text>}
                    <ReminderActions reminder={reminder} isCompleted={isCompleted} />
                </View>
            </View>
        </View>
    )
}

const ReminderWithoutMessage = ({ reminder, isCompleted }: { reminder: Reminder, isCompleted: boolean }) => {
    const { myProfile: currentUser } = useCurrentRavenUser()
    const { description, name } = reminder

    return (
        <View className='flex-1 flex flex-row px-3 gap-2 py-2'>
            <UserAvatar
                src={currentUser?.user_image ?? ""}
                alt={currentUser?.name ?? ""}
            />
            <View className='flex-1 items-start gap-1'>
                <Text className='font-semibold text-base text-foreground'>{currentUser?.full_name}</Text>
                <Text className='text-sm text-muted-foreground'>{description}</Text>
                <ReminderActions reminder={reminder} isCompleted={isCompleted} />
            </View>
        </View>
    )
}