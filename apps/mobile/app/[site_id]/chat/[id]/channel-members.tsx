import { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { UserFields } from '@raven/types/common/UserFields';
import { useUserListProvider } from '@raven/lib/providers/UserListProvider';
import { Divider } from '@components/layout/Divider';
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import ChannelMemberRow from '@components/features/channel-settings/Members/ChannelMemberRow';
import SearchInput from '@components/common/SearchInput/SearchInput';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';
import { TouchableOpacity } from 'react-native-gesture-handler';

const ChannelMembers = () => {

    const { colors } = useColorScheme()
    const insets = useSafeAreaInsets()

    const { id: channelId } = useLocalSearchParams()

    const [searchQuery, setSearchQuery] = useState('')
    const debouncedText = useDebounce(searchQuery, 200)

    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "");
    const { enabledUsers } = useUserListProvider()
    const extractChannelMembers = Array.from(enabledUsers.values()).filter(user => channelMembers?.[user.name]);

    const filteredMembers = useMemo(() => {
        const lowerCaseInput = debouncedText?.toLowerCase() || ''
        return extractChannelMembers.filter((user: UserFields) => {
            if (!debouncedText) return true;

            return (
                user?.full_name.toLowerCase().includes(lowerCaseInput) ||
                user?.name.toLowerCase().includes(lowerCaseInput)
            )
        })
    }, [debouncedText, extractChannelMembers])

    return (
        <View className='flex-1 bg-background'>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                        <ChevronLeftIcon stroke={colors.foreground} />
                    </TouchableOpacity>
                ),
                headerTitle: () => <Text className='ml-2 text-base text-foreground font-semibold'>Members</Text>,
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.push(`./add-members`)} hitSlop={10}>
                        <Text className='text-base font-semibold text-primary dark:text-secondary'>Add</Text>
                    </TouchableOpacity>
                )
            }} />
            <View className='px-4 py-3'>
                <SearchInput
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom, height: "auto" }}
                bounces={false}
                showsVerticalScrollIndicator={false}>
                <View className='flex-1'>
                    <FlashList
                        data={filteredMembers}
                        renderItem={({ item }) => <ChannelMemberRow member={item as Member} />}
                        keyExtractor={(item) => item.name}
                        estimatedItemSize={64}
                        ItemSeparatorComponent={() => <Divider className='mx-0' />}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={!debouncedText.length ? () => {
                            return (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-[15px] text-center text-muted-foreground">
                                        No channel members found
                                    </Text>
                                </View>
                            )
                        } : undefined}
                    />
                </View>
            </KeyboardAwareScrollView>

            {!filteredMembers.length && debouncedText.length ? (
                <View className="absolute inset-0 items-center justify-center h-60">
                    <Text className="text-[15px] text-center text-muted-foreground">
                        No results found for searched text <Text className='font-semibold'>'{debouncedText}'</Text>
                    </Text>
                </View>
            ) : null}

        </View>
    )
}

export default ChannelMembers

export const ErrorBoundary = CommonErrorBoundary