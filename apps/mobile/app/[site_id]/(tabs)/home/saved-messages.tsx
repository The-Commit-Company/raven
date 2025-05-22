import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { useColorScheme } from '@hooks/useColorScheme';
import { Platform, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import BookMarkIcon from '@assets/icons/BookmarkIcon.svg';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Message } from '@raven/types/common/Message';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import SavedMessageItem from '@components/features/saved-messages/SavedMessageItem';
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import { LegendList } from '@legendapp/list';
import ErrorBanner from '@components/common/ErrorBanner';
import { SegmentedControl } from '@components/nativewindui/SegmentedControl';
import { useState } from 'react';
import { Divider } from '@components/layout/Divider';
import InProgressReminders from '@components/features/remind-me/InProgressReminders';
import CompletedReminders from '@components/features/remind-me/CompletedReminders';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import ClearCompletedRemindersButton from '@components/features/remind-me/ClearCompletedRemindersButton';
import { COLORS } from '@theme/colors';

export default function SavedMessages() {
    const { colors } = useColorScheme()
    const [activetab, setActiveTab] = useState('Saved Messages')

    return <>
        <Stack.Screen options={{
            title: 'Saved Messages',
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
                return activetab === 'Completed' ? <ClearCompletedRemindersButton /> : null;
            }
        }} />
        <Tabs setActiveTab={setActiveTab} activeTab={activetab} />
    </>
}

const Tabs = ({ setActiveTab, activeTab }: { setActiveTab: (tab: string) => void, activeTab: string }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const values = ['Saved Messages', 'In Progress', 'Completed']

    const handleIndexChange = (index: number) => {
        setSelectedIndex(index)
    }

    return (
        <View className='flex-1 flex-col'>
            <View className='flex flex-col gap-3'>
                <View className='p-3 pb-0'>
                    <SegmentedControl
                        values={values}
                        selectedIndex={selectedIndex}
                        onIndexChange={handleIndexChange}
                        onValueChange={setActiveTab}
                    />
                </View>
                <Divider prominent />
            </View>
            <View className='flex-1 relative'>
                {selectedIndex === 0 && <SavedMessagesContent />}
                {selectedIndex === 1 && <InProgressReminders />}
                {selectedIndex === 2 && <CompletedReminders />}

                {/* Floating Action Button */}
                {activeTab !== 'Saved Messages' ? (
                    <View className='absolute bottom-6 right-6'>
                        <Link asChild href="./new-reminder">
                            <Button variant="primary" className='w-12 h-12 rounded-full justify-center items-center'>
                                <PlusIcon fill={COLORS.white} height={24} width={24} />
                            </Button>
                        </Link>
                    </View>
                ) : null}
            </View>
        </View>
    )
}

const SavedMessagesContent = () => {

    const { colors } = useColorScheme()

    const { data, isLoading, error } = useFrappeGetCall<{ message: (Message & { workspace?: string })[] }>("raven.api.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })

    if (isLoading) {
        return <View className="flex-1 justify-center items-center h-full">
            <ActivityIndicator />
        </View>
    }

    if (!data && error) {
        return (
            <View className='p-4'>
                <ErrorBanner error={error} />
            </View>
        )
    }

    return <LegendList
        data={data?.message ?? []}
        ListEmptyComponent={<SavedMessagesEmptyState />}
        renderItem={({ item }) => <SavedMessageItem message={item} />}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingTop: 8, backgroundColor: colors.background }}
        estimatedItemSize={154}
    />
}

const SavedMessagesEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col p-4 gap-2 bg-background">
            <View className="flex flex-row items-center gap-2">
                <BookMarkIcon fill={colors.icon} height={20} width={20} />
                <Text className="text-foreground text-base font-medium">Your saved messages will appear here</Text>
            </View>
            <Text className="text-sm text-foreground/60">
                Saved messages are a convenient way to keep track of important information or messages you want to refer back to later.
            </Text>
            <Text className="text-sm text-foreground/60">
                You can save messages by simply clicking on the bookmark icon in message actions.
            </Text>
        </View>
    )
}