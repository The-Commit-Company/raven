import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";
import { useFrappeDeleteDoc, useFrappeGetCall, useSWRConfig } from "frappe-react-sdk"
import { EmptyStateForCompletedReminders } from "@/components/layout/EmptyState/EmptyState"
import ReminderCard, { Reminder } from "./Reminder"
import { PiBroom } from "react-icons/pi"
import CreateReminderButton from "./CreateReminderButton"
import { toast } from "sonner";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";

const CompletedReminders = () => {
    const { data, error } = useFrappeGetCall("raven.api.reminder.get_reminders",
        { is_complete: true },
        "completed_reminders"
    )

    if (error) {
        return <Box className="p-3">
            <ErrorBanner error={error} />
        </Box>
    }

    return (
        <Box className="relative">
            <Box className='flex gap-2 p-2 border-b border-gray-4 justify-end'>
                {data?.message.length > 0 && (
                    <ClearCompletedRemindersButton reminders={data?.message} />
                )}
                <CreateReminderButton />
            </Box>

            <Box className="h-[calc(100vh-10rem)] overflow-y-auto">
                <CompletedRemindersList reminders={data?.message} />
            </Box>
        </Box>
    )
}

export default CompletedReminders

const CompletedRemindersList = ({ reminders }: { reminders: Reminder[] }) => {

    if (reminders && reminders.length === 0) {
        return <EmptyStateForCompletedReminders />
    }

    return (
        <Flex direction='column' justify='start'>
            {reminders?.map((reminder: Reminder) => (
                <ReminderCard
                    key={reminder.name}
                    reminder={reminder}
                    isCompleted={true}
                />
            ))}
        </Flex>
    )
}

const ClearCompletedRemindersButton = ({ reminders }: { reminders: Reminder[] }) => {
    const { mutate } = useSWRConfig()
    const { deleteDoc, loading } = useFrappeDeleteDoc()

    const handleDeleteItems = async () => {
        try {
            await Promise.all(
                reminders.map(reminder =>
                    deleteDoc("Raven Reminder", reminder.name)
                )
            )

            toast.success("Reminders cleared successfully")

            mutate("completed_reminders")
        } catch (error) {
            console.error("Error deleting reminders:", error)
        }
    }

    return (
        <Tooltip content="Clear completed items">
            <IconButton
                size="1"
                variant="soft"
                color="gray"
                aria-label="clear completed items"
                onClick={handleDeleteItems}
                loading={loading}
            >
                <PiBroom />
            </IconButton>
        </Tooltip>
    )
}