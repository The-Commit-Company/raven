import { Box, Flex } from "@radix-ui/themes";
import { useFrappeGetCall, useSWRConfig } from "frappe-react-sdk"
import { useState } from "react";
import { EmptyStateForInProgressReminders } from "@/components/layout/EmptyState/EmptyState"
import CreateReminderButton from "./CreateReminderButton"
import ReminderCard, { Reminder } from "./Reminder"
import { RemindMeMessageDialog } from "../chat/ChatMessage/MessageActions/RemindMeMessage";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";

const InProgressReminders = () => {
    const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const { mutate } = useSWRConfig()

    const { data, error, mutate: mutateReminders } = useFrappeGetCall("raven.api.reminder.get_reminders",
        { is_complete: false },
        "in_progress_reminders"
    )

    if (error) {
        return <Box className="p-3">
            <ErrorBanner error={error} />
        </Box>
    }

    const handleEditReminder = (reminder: Reminder) => {
        setSelectedReminder(reminder)
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setSelectedReminder(null)
        mutateReminders()
        mutate("reminders_count")
    }

    const handleCloseCreateReminder = () => {
        mutateReminders()
    }

    return (
        <Box className="relative">
            <Box className='flex gap-2 justify-end p-2 border-b border-gray-4'>
                <CreateReminderButton onClose={handleCloseCreateReminder} />
            </Box>

            <Box className="h-[calc(100vh-10rem)] overflow-y-auto">
                <InProgressRemindersList
                    reminders={data?.message}
                    onEditReminder={handleEditReminder}
                />
            </Box>

            <RemindMeMessageDialog
                reminder={selectedReminder}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
            />
        </Box>
    )
}

export default InProgressReminders

interface InProgressRemindersListProps {
    reminders: Reminder[]
    onEditReminder: (reminder: Reminder) => void
}

const InProgressRemindersList = ({ reminders, onEditReminder }: InProgressRemindersListProps) => {

    if (reminders && reminders.length === 0) {
        return <EmptyStateForInProgressReminders />
    }

    return (
        <Flex direction='column' gap='1' justify='start'>
            {reminders?.map((reminder: Reminder) => (
                <ReminderCard
                    key={reminder.name}
                    reminder={reminder}
                    onEditClick={onEditReminder}
                />
            ))}
        </Flex>
    )
}