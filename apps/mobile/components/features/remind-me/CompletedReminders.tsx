import { LegendList } from '@legendapp/list'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { View, ActivityIndicator } from 'react-native'
import ReminderItem, { Reminder } from './ReminderItem'
import ErrorBanner from '@components/common/ErrorBanner'
import { useColorScheme } from '@hooks/useColorScheme'
import CheckCircleIcon from '@assets/icons/CheckFilledIcon.svg'
import { Text } from '@components/nativewindui/Text'

const CompletedReminders = () => {

    const { colors } = useColorScheme()

    const { data, isLoading, error } = useFrappeGetCall<{ message: Reminder[] }>("raven.api.reminder.get_reminders",
        { is_complete: true },
        "completed_reminders"
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
                renderItem={({ item }) => <ReminderItem reminder={item} isCompleted={true} />}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingTop: 8, backgroundColor: colors.background }}
                estimatedItemSize={157}
                ListEmptyComponent={<CompletedRemindersEmptyState />}
            />
        </View>
    )
}

const CompletedRemindersEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col p-4 gap-1 bg-background">
            <View className="flex flex-row items-center gap-2">
                <CheckCircleIcon fill={colors.icon} height={20} width={20} />
                <Text className="text-foreground text-base font-medium">No completed reminders</Text>
            </View>
            <View>
                <Text className="text-sm text-foreground/60">
                    Completed reminders will appear here once you mark your in-progress reminders as done.
                </Text>
                <Text className="text-sm text-foreground/60">
                    You can mark reminders as complete by using the "Mark as Complete" action in the reminder menu.
                </Text>
            </View>
        </View>
    )
}

export default CompletedReminders