import { useFrappePostCall } from "frappe-react-sdk"
import { ErrorBanner, getErrorMessage } from "../../../../layout/AlertBanner/ErrorBanner"
import { AlertDialog, Button, Flex, Text, TextArea, TextField, Select, Box } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { Message } from "../../../../../../../types/Messaging/Message"
import { toast } from "sonner"
import { useState, ChangeEvent, useEffect } from "react"
import dayjs from "dayjs"
import { Label } from "@/components/common/Form"
import { __ } from "@/utils/translations"

interface Reminder {
    name: string
    remind_at: string
    description: string
    is_complete: boolean
    completed_at: string
    message_id: string
    channel_name: string
    is_direct_message: boolean
}

interface RemindMeModalProps {
    onClose: () => void,
    message?: Message,
    reminder?: Reminder // Optional reminder for edit mode
}

export const RemindMeModal = ({ onClose, message, reminder }: RemindMeModalProps) => {

    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [time, setTime] = useState("")
    const [description, setDescription] = useState("")

    const isEditMode = !!reminder
    const isNewReminder = !message && !reminder

    const { call: createReminder, error: createError, loading: creatingReminder } = useFrappePostCall("raven.api.reminder.create_reminder")
    const { call: updateReminder, error: updateError, loading: updatingReminder } = useFrappePostCall("raven.api.reminder.update_reminder")

    const loading = creatingReminder || updatingReminder
    const error = createError || updateError

    // Generate time options in 15-minute intervals
    const timeOptions = Array.from({ length: 96 }, (_, i) => {
        const hours = Math.floor(i / 4)
        const minutes = (i % 4) * 15
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    })

    // Set default time to nearest 15-minute interval for new reminders
    // Or set existing time for editing
    useEffect(() => {
        if (isEditMode && reminder) {
            const reminderDate = dayjs(reminder.remind_at)
            setDate(reminderDate.format('YYYY-MM-DD'))
            setTime(reminderDate.format('HH:mm'))
            setDescription(reminder.description || '')
        } else {
            const now = new Date()
            const minutes = now.getMinutes()
            const roundedMinutes = Math.ceil(minutes / 15) * 15
            const hours = now.getHours()
            const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours
            const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes
            const defaultTime = `${adjustedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
            setTime(defaultTime)
        }
    }, [reminder])

    const onSubmit = async () => {
        if (!date || !time) {
            toast.error('Please select both date and time')
            return
        }

        if (date < new Date().toISOString().split('T')[0]) {
            toast.error('Please select a date in the future')
            return
        }

        const remind_at = `${date}T${time}`

        if (isEditMode) {
            updateReminder({
                reminder_id: reminder.name,
                remind_at,
                description
            }).then(() => {
                toast.success('Reminder updated successfully')
                onClose()
            }).catch((e: any) => {
                toast.error('Could not update the reminder', {
                    description: getErrorMessage(e)
                })
            })
        } else {
            const payload: any = {
                remind_at,
                description
            }

            if (message) {
                payload.message_id = message.name
            }

            createReminder(payload).then(() => {
                toast.success('Reminder created successfully')
                onClose()
            }).catch((e: any) => {
                toast.error('Could not create the reminder', {
                    description: getErrorMessage(e)
                })
            })
        }
    }

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)
    const handleTimeChange = (value: string) => setTime(value)
    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)

    return (
        <>
            <AlertDialog.Title>
                {isEditMode ? 'Edit Reminder' : 'New Reminder'}
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={error} />
                {!isEditMode && !isNewReminder && (
                    <Text size='2'>Are you sure you want to remind yourself ?</Text>
                )}

                <Flex gap='3' align={'center'} justify={'between'} pt='3'>
                    <Box className="flex-1">
                        <Label htmlFor='date' isRequired>{__("Date")}</Label>
                        <TextField.Root type="date" value={date} onChange={handleDateChange} />
                    </Box>
                    <Box className="flex-1">
                        <Label htmlFor='time' isRequired>{__("Time")}</Label>
                        <Select.Root value={time} onValueChange={handleTimeChange}>
                            <Select.Trigger className="w-full" />
                            <Select.Content className="max-h-[200px] overflow-y-auto">
                                {timeOptions.map((timeOption) => (
                                    <Select.Item key={timeOption} value={timeOption}>
                                        {timeOption}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Box>
                </Flex>

                <Box>
                    <Label htmlFor='description'>{__("Description")}</Label>
                    <TextArea
                        required
                        placeholder="Add a description"
                        value={description}
                        onChange={handleDescriptionChange}
                    />
                </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" onClick={onSubmit} disabled={loading || !date || !time}>
                        {loading && <Loader className="text-white" />}
                        {loading ? "Saving" : isEditMode ? "Save Changes" : "Save"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}