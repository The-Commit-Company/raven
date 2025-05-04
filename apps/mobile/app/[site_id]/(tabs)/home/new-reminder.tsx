import { useState } from 'react';
import { View, TextInput, Platform, Pressable } from 'react-native';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk';
import { toast } from 'sonner-native';
import dayjs from 'dayjs';
import { Reminder } from '@components/features/remind-me/ReminderItem';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Text } from '@components/nativewindui/Text';

const NewReminder = () => {
    const { message_id, reminder: reminderParam } = useLocalSearchParams()
    const reminder = reminderParam ? JSON.parse(decodeURIComponent(reminderParam as string)) as Reminder : undefined

    const { mutate } = useSWRConfig()
    const { colors } = useColorScheme();

    const isEditMode = !!reminder

    // Initialize state with reminder data if in edit mode
    const [date, setDate] = useState(() => {
        if (isEditMode && reminder) {
            return dayjs(reminder.remind_at).toDate()
        }
        // For new reminders, round to nearest 15 minutes
        const now = new Date()
        const minutes = now.getMinutes()
        const roundedMinutes = Math.ceil(minutes / 15) * 15
        const hours = now.getHours()
        const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours
        const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes

        now.setHours(adjustedHours)
        now.setMinutes(finalMinutes)
        now.setSeconds(0)
        now.setMilliseconds(0)

        return now
    });

    const [description, setDescription] = useState(() => {
        if (isEditMode && reminder) {
            return reminder.description || ''
        }
        return ''
    });

    // Generate time options in 15-minute intervals
    const timeOptions = Array.from({ length: 96 }, (_, i) => {
        const hours = Math.floor(i / 4)
        const minutes = (i % 4) * 15
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    })

    const { call: createReminder, error: createError, loading: creatingReminder } = useFrappePostCall("raven.api.reminder.create_reminder")
    const { call: updateReminder, error: updateError, loading: updatingReminder } = useFrappePostCall("raven.api.reminder.update_reminder")

    const loading = creatingReminder || updatingReminder

    const onSubmit = async () => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD')
        const formattedTime = dayjs(date).format('HH:mm')
        const remind_at = `${formattedDate}T${formattedTime}`

        if (isEditMode && reminder) {
            updateReminder({
                reminder_id: reminder.name,
                remind_at,
                description
            }).then(() => {
                toast.success('Reminder updated successfully')
                router.back()
                mutate("in_progress_reminders")
                mutate("completed_reminders")
            }).catch((err) => {
                toast.error('Failed to update reminder')
            })
        } else {
            createReminder({
                remind_at,
                description,
                message_id
            }).then(() => {
                toast.success('Reminder created successfully')
                router.back()
                mutate("in_progress_reminders")
                mutate("completed_reminders")
            }).catch((err) => {
                toast.error('Failed to create reminder')
            })
        }
    }

    const onChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeSelect = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        const newDate = new Date(date)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        setDate(newDate)
    }

    return (
        <View className="flex-1">
            <Stack.Screen options={{
                title: isEditMode ? 'Edit Reminder' : 'New Reminder',
                headerStyle: { backgroundColor: colors.background },
                headerLeft: Platform.OS === 'ios' ? () => {
                    return (
                        <Link asChild href="../" relativeToDirectory>
                            <Button variant="plain" className="ios:px-0" hitSlop={10}>
                                <ChevronLeftIcon color={colors.icon} />
                            </Button>
                        </Link>
                    )
                } : undefined,
                headerRight: () => {
                    return (
                        <Button onPress={onSubmit} disabled={!date || loading} variant="plain" className="ios:px-0">
                            <Text className="text-base font-medium text-primary">Save</Text>
                        </Button>
                    )
                },
            }} />

            {/* When */}
            <View className="px-4 py-4 border-b border-border/50 flex flex-row justify-between items-center">
                <Text className="text-base">When</Text>
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            </View>

            {/* Time */}
            <View className="border-b border-border/50">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Pressable className="px-4 py-4 flex flex-row justify-between items-center active:bg-linkColor active:dark:bg-linkColor">
                            <Text className="text-base">Time</Text>
                            <Text className="text-base">{dayjs(date).format('HH:mm')}</Text>
                        </Pressable>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content side='bottom'>
                        {timeOptions.map((time) => (
                            <DropdownMenu.Item
                                key={time}
                                onSelect={() => onTimeSelect(time)}
                                textValue={time}
                            >
                                <DropdownMenu.ItemTitle>
                                    {time}
                                </DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </View>

            {/* Description */}
            <View className="px-4 pt-4">
                <Text className="text-base">Description</Text>
                <TextInput
                    className="text-base text-muted-foreground mt-2 p-0 border-b-0"
                    placeholder="Set a Reminder"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#aaa"
                />
            </View>
        </View>
    );
};

export default NewReminder;