import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { useCallback, useMemo, useState } from 'react';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useUserListProvider } from '@raven/lib/providers/UserListProvider';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { UserFields } from '@raven/types/common/UserFields';
import { TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import UserAvatar from '@components/layout/UserAvatar';
import { Text } from '@components/nativewindui/Text';
import { Divider } from '@components/layout/Divider';
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckIcon from "@assets/icons/CheckIcon.svg"
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useFrappeCreateDoc, useSWRConfig } from 'frappe-react-sdk';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { useFetchWorkspaceMembers } from '@raven/lib/hooks/useFetchWorkspaceMembers';

export default function AddNewChannelMembers() {

    const { colors } = useColorScheme()

    const { id: channelId } = useLocalSearchParams()

    const { channel } = useCurrentChannelData(channelId as string ?? "")

    const { data: workspaceMembers } = useFetchWorkspaceMembers(channel?.channelData.workspace ?? "")

    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

    const handleDeleteMember = useCallback((member: Member) => {
        setSelectedMembers((prevMembers: Member[]) => prevMembers.filter(m => m.name !== member.name))
    }, [setSelectedMembers])

    const insets = useSafeAreaInsets();

    const [inputText, setInputText] = useState("");
    const debouncedText = useDebounce(inputText, 200)

    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "");
    const { enabledUsers } = useUserListProvider()

    const nonChannelMembers = useMemo(() => {

        const eligibleUsers: { [key: string]: string } = {}

        workspaceMembers?.message.forEach((m) => {
            eligibleUsers[m.user] = m.name
        })

        return Array.from(enabledUsers.values()).filter(user => !channelMembers?.[user.name] && eligibleUsers?.[user.name]);
    }, [])

    const filteredMembers = useMemo(() => {
        const lowerCaseInput = debouncedText?.toLowerCase() || '';

        return nonChannelMembers.filter((user: UserFields) => {

            if (!debouncedText) return true;

            return (
                user?.full_name.toLowerCase().includes(lowerCaseInput) ||
                user?.name.toLowerCase().includes(lowerCaseInput)
            );
        });
    }, [debouncedText, nonChannelMembers, selectedMembers]);

    const handleSelectMember = useCallback((member: Member, index: number) => {
        setSelectedMembers((prevMembers) =>
            prevMembers.find((m) => m.name === member.name)
                ? prevMembers.filter((m) => m.name !== member.name)
                : [...prevMembers, member]
        );
    }, [selectedMembers]);

    const { mutate } = useSWRConfig();
    const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc();

    const submit = () => {
        if (selectedMembers && selectedMembers.length > 0) {
            const promises = selectedMembers.map(async (member: Member) => {
                return createDoc("Raven Channel Member", {
                    channel_id: channelId,
                    user_id: member.name,
                });
            });

            Promise.all(promises)
                .then(() => {
                    //   toast.success("Members added");
                    mutate(["channel_members", channelId]);
                    router.back()
                })
                .catch((error) => {
                    //   toast.warning(error.exception.split(": ")[1]);
                })
                .finally(() => {
                    setSelectedMembers([]);
                    setInputText("");
                });
        }
    }

    return (
        <View className='flex-1 p-3'>
            <Stack.Screen options={{
                title: 'Add Channel Members',
                headerLeft() {
                    return (
                        <Link asChild href="../" relativeToDirectory>
                            <Button variant="plain" className="ios:px-0" hitSlop={10}>
                                <CrossIcon fill={colors.icon} height={24} width={24} />
                            </Button>
                        </Link>
                    )
                },
                headerRight() {
                    return (
                        <Button variant="plain" className="ios:px-0"
                            onPress={() => selectedMembers.length && submit()}
                            disabled={creatingDoc || !selectedMembers.length}>
                            {creatingDoc ?
                                <ActivityIndicator size="small" color={colors.primary} /> :
                                <Text className="text-primary">Add</Text>}
                        </Button>
                    )
                },
                headerSearchBarOptions: {
                    onChangeText: (e) => setInputText(e.nativeEvent.text),
                    cancelButtonText: "Cancel",
                    autoFocus: true,
                    inputType: "text",
                    tintColor: colors.primary,
                    placeholder: "Search members...",
                },
                headerStyle: { backgroundColor: colors.background }
            }} />

            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {selectedMembers.length ? (
                    <>
                        <View className='flex-1 p-2.5 py-3 items-center flex-wrap inset-0'>
                            <Animated.FlatList
                                itemLayoutAnimation={LinearTransition}
                                data={selectedMembers}
                                horizontal
                                renderItem={({ item }) => {
                                    return (
                                        <Animated.View entering={ZoomIn} exiting={ZoomOut.duration(300)}>
                                            <TouchableOpacity activeOpacity={0.6} onPress={() => handleDeleteMember(item as Member)} className='relative mr-4 mb-1.5'>
                                                <UserAvatar
                                                    src={item.user_image ?? ""}
                                                    alt={item.full_name ?? ""}
                                                    availabilityStatus={item.availability_status}
                                                    avatarProps={{ className: "w-10 h-10" }}
                                                />

                                                <View className='w-4 h-4 absolute -bottom-1.5 -right-1.5 items-center justify-center rounded-full border border-gray-100 bg-gray-500 dark:bg-gray-600 z-50'>
                                                    <CrossIcon fill="white" height={13} width={13} />
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )
                                }}
                                keyExtractor={(item) => item.name}
                                bounces={false}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                        <Divider className='mx-0' />
                    </>
                ) : null}

                <View className='flex-1'>
                    <FlashList
                        data={filteredMembers}
                        renderItem={({ item, index }) => {
                            const isMemberSelected = selectedMembers.find(member => member.name === item.name)

                            return (
                                <TouchableOpacity activeOpacity={0.6} onPress={() => handleSelectMember(item as Member, index)} className='flex-row items-center justify-between rounded-md px-2.5'>
                                    <View className='gap-3 py-2.5 flex-row items-center'>
                                        <View className='relative'>
                                            <UserAvatar
                                                src={item.user_image ?? ""}
                                                alt={item.full_name ?? ""}
                                                availabilityStatus={item.availability_status}
                                            />
                                            <View className='absolute -bottom-1.5 -right-1.5'>
                                                {isMemberSelected && (
                                                    <Animated.View entering={ZoomIn} exiting={ZoomOut} className='w-5 h-5 items-center justify-center rounded-full border-2 border-gray-100 bg-green-500'>
                                                        <CheckIcon fill="white" width={13} height={13} />
                                                    </Animated.View>
                                                )}
                                            </View>
                                        </View>
                                        <View className='flex-col gap-1'>
                                            <Text className='text-gray-700 dark:text-gray-300 font-semibold text-sm'>{item.full_name}</Text>
                                            <Text className='text-gray-600 dark:text-gray-400 text-sm'>{item.name}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                        keyExtractor={(item) => item.name}
                        estimatedItemSize={56}
                        ItemSeparatorComponent={() => <Divider className='mx-0' />}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={!debouncedText.length ? () => {
                            return (
                                <View className="flex-1 items-center justify-center min-h-screen">
                                    <Text className="text-gray-500 text-center font-medium">
                                        No channel members found.
                                    </Text>
                                </View>
                            )
                        } : undefined}
                    />
                </View>
            </KeyboardAwareScrollView>

            {!filteredMembers.length && debouncedText.length ? (
                <View className="absolute inset-0 items-center justify-center min-h-screen">
                    <Text className="text-gray-500 text-center font-sm">
                        No results found for searched text '{debouncedText}'
                    </Text>
                </View>
            ) : null}
        </View>
    )
}