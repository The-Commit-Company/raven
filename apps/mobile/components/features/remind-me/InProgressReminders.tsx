import { LegendList } from '@legendapp/list'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { View, ActivityIndicator } from 'react-native'
import ReminderItem, { Reminder } from './ReminderItem'
import ErrorBanner from '@components/common/ErrorBanner'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import ClockIcon from '@assets/icons/ClockIcon.svg'

const InProgressReminders = () => {

    const { colors } = useColorScheme()

    const { data, isLoading, error } = useFrappeGetCall<{ message: Reminder[] }>("raven.api.reminder.get_reminders",
        { is_complete: false },
        "in_progress_reminders"
    )

    if (isLoading) {
        return <View className='flex-1 justify-center items-center h-full'>
            <ActivityIndicator />
        </View>
    }

    if (error) {
        return <View className='p-3'>
            <ErrorBanner error={error} />
        </View>
    }

    return (
        <View className='flex-1'>
            <LegendList
                data={data?.message ?? []}
                renderItem={({ item }) => <ReminderItem reminder={item} />}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingTop: 8, backgroundColor: colors.background }}
                estimatedItemSize={157}
                ListEmptyComponent={<InProgressRemindersEmptyState />}
            />
        </View>
    )
}

export default InProgressReminders

const InProgressRemindersEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col p-4 gap-1 bg-background">
            <View className="flex flex-row items-center gap-2">
                <ClockIcon fill={colors.icon} height={20} width={20} />
                <Text className="text-foreground text-base font-medium">No reminders in progress</Text>
            </View>
            <View>
                <Text className="text-sm text-foreground/60">
                    Reminders help you keep track of important tasks and messages that need your attention.
                </Text>
                <Text className="text-sm text-foreground/60">
                    You can create reminders by using the "Remind Me" feature in message actions.
                </Text>
            </View>
        </View>
    )
}