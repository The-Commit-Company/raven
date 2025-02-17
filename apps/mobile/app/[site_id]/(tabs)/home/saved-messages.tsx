import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { FlatList, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import BookMarkIcon from '@assets/icons/BookmarkIcon.svg';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Message } from '@raven/types/common/Message';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import SavedMessageItem from '@components/features/saved-messages/SavedMessageItem';

export default function SavedMessages() {

    const { colors, isDarkColorScheme } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Saved messages',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className='flex-1'>
            <SavedMessagesContent />
        </View>
    </>
}

const SavedMessagesContent = () => {

    const { data, isLoading } = useFrappeGetCall<{ message: (Message & { workspace?: string })[] }>("raven.api.raven_message.get_saved_messages", undefined, undefined, {
        revalidateOnFocus: false
    })

    if (isLoading) {
        return <View className="flex-1 justify-center items-center h-full">
            <ActivityIndicator />
        </View>
    }

    return <FlatList
        data={data?.message ?? []}
        ListEmptyComponent={<SavedMessagesEmptyState />}
        renderItem={({ item }) => <SavedMessageItem message={item} />}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingTop: 8 }}
    />
}

const SavedMessagesEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col p-4 gap-2">
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