import { Reminder } from './ReminderItem'
import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import DeleteSweepIcon from '@assets/icons/DeleteSweepIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { Button } from '@components/nativewindui/Button'

const ClearCompletedRemindersButton = () => {
    const { colors } = useColorScheme()
    const { deleteDoc, loading } = useFrappeDeleteDoc()

    const { data, error, mutate: mutateCompletedReminders } = useFrappeGetCall("raven.api.reminder.get_reminders",
        { is_complete: true },
        "completed_reminders"
    )

    // Return null if there are no completed reminders
    if (!data?.message || data?.message?.length === 0) {
        return null
    }

    const handleDelete = () => {
        Promise.all(data.message.map((reminder: Reminder) => deleteDoc('Raven Reminder', reminder.name)))
            .then(() => {
                toast.success('Completed reminders cleared successfully')
                mutateCompletedReminders()
            })
            .catch((error) => {
                console.error('Error clearing reminders:', error)
                toast.error('Failed to clear reminders')
            })
    }

    return (
        <Button disabled={loading} variant="plain" hitSlop={5} className='ios:px-0' onPress={handleDelete}>
            <DeleteSweepIcon fill={colors.icon} height={21} width={21} />
        </Button>
    )
}

export default ClearCompletedRemindersButton