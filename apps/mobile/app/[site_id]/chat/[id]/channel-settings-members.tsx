import { useMemo, useState } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { useFrappeDeleteDoc, useFrappeGetCall, useSWRConfig } from 'frappe-react-sdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import Reanimated, { configureReanimatedLogger, SharedValue, useAnimatedStyle, ZoomOutLeft } from 'react-native-reanimated';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { UserFields } from '@raven/types/common/UserFields';
import { useUserListProvider } from '@raven/lib/providers/UserListProvider';
import UserAvatar from '@components/layout/UserAvatar';
import { Divider } from '@components/common/DIvider';
import AddUserIcon from "@assets/icons/AddUserIcon.svg"
import HorizontalDots from "@assets/icons/HorizontalDots.svg"
import { useColorScheme } from '@hooks/useColorScheme';
import { Button } from '@components/nativewindui/Button';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import TrashIcon from "@assets/icons/TrashIcon.svg"
import CrownIcon from "@assets/icons/CrownIcon.svg"
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

configureReanimatedLogger({
    strict: false,
})

const ChannelMembers = () => {

    const { colors } = useColorScheme()

    const { id: channelId } = useLocalSearchParams()

    const insets = useSafeAreaInsets();

    const [inputText, setInputText] = useState("");
    const debouncedText = useDebounce(inputText, 200)

    const { myProfile: currentUserInfo } = useCurrentRavenUser()

    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "");
    const { enabledUsers } = useUserListProvider()
    const extractChannelMembers = Array.from(enabledUsers.values()).filter(user => channelMembers?.[user.name]);

    const filteredMembers = useMemo(() => {
        const lowerCaseInput = debouncedText?.toLowerCase() || '';

        return extractChannelMembers.filter((user: UserFields) => {
            if (!debouncedText) return true;

            return (
                user?.full_name.toLowerCase().includes(lowerCaseInput) ||
                user?.name.toLowerCase().includes(lowerCaseInput)
            );
        });
    }, [debouncedText, extractChannelMembers]);

    function RightAction(prog: SharedValue<number>, drag: SharedValue<number>, member: Member) {

        const styleAnimation = useAnimatedStyle(() => {
            return {
                transform: [{ translateX: drag.value + 70 }],
            };
        });

        const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()

        const { mutate } = useSWRConfig()

        const { data: memberInfo, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
            doctype: "Raven Channel Member",
            filters: JSON.stringify({ channel_id: channelId, user_id: member?.name }),
            fieldname: JSON.stringify(["name"])
        }, undefined, {
            revalidateOnFocus: false
        })

        const onSubmit = async () => {
            return deleteDoc('Raven Channel Member', memberInfo?.message.name).then(() => {
                // toast.success(`Removed`)
                mutate(["channel_members", channelId])
            })
        }

        return (
            <Reanimated.View style={styleAnimation}>
                <TouchableOpacity activeOpacity={0.6} onPress={onSubmit} style={{ width: 70, height: "100%" }} className="bg-red-500 dark:bg-red-600 items-center justify-center">
                    <TrashIcon width={22} height={22} fill="white" />
                </TouchableOpacity>
            </Reanimated.View>
        );
    }

    return (
        <View className='flex-1 p-3'>
            <Stack.Screen
                options={{
                    title: 'Channel Members',
                    headerTransparent: Platform.OS === 'ios',
                    headerBlurEffect: 'systemMaterial',
                    headerShadowVisible: true,
                    headerSearchBarOptions: {
                        onChangeText: (e) => setInputText(e.nativeEvent.text),
                        cancelButtonText: "Cancel",
                        autoFocus: true,
                        inputType: "text",
                        tintColor: colors.primary,
                        placeholder: "Search channel members...",
                    },
                    headerStyle: { backgroundColor: colors.background }
                }}
            />
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View className='flex-1 pb-0'>
                    <FlashList
                        data={filteredMembers}
                        renderItem={({ item }) => {
                            return (
                                <ReanimatedSwipeable
                                    friction={2}
                                    enableTrackpadTwoFingerGesture
                                    rightThreshold={40}
                                    renderRightActions={(prog, drag) => RightAction(prog, drag, item as Member)}
                                >
                                    <View className='flex-row items-center justify-between rounded-md'>
                                        <View className='gap-3 p-3 flex-row items-center'>
                                            <UserAvatar
                                                src={item.user_image ?? ""}
                                                alt={item.full_name ?? ""}
                                                availabilityStatus={item.availability_status}
                                            />
                                            <View className='flex-col gap-1'>
                                                <View className='flex-row gap-2'>
                                                    <Text className='text-gray-700 dark:text-gray-300 font-semibold'>
                                                        {item.full_name?.length > 16
                                                            ? `${item.full_name.slice(0, 16)}...`
                                                            : item.full_name}
                                                        {item.name === currentUserInfo?.name ? " (You)" : ""}
                                                    </Text>
                                                    {channelMembers[item.name].is_admin ? <CrownIcon fill="#FFC53D" width={16} height={16} /> : null}
                                                </View>
                                                <Text className='text-gray-600 dark:text-gray-400'>{item.name}</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity activeOpacity={0.7} className='p-2 rounded-full'>
                                            <HorizontalDots width={20} height={20} fill={colors.icon} />
                                        </TouchableOpacity>
                                    </View>
                                </ReanimatedSwipeable>
                            )
                        }}
                        keyExtractor={(item) => item.name}
                        estimatedItemSize={56}
                        ItemSeparatorComponent={() => <Divider className='mx-0' />}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {!filteredMembers.length && debouncedText.length ? (
                    <View className='flex-1 items-center justify-center'>
                        <Text className='text-gray-500 text-center font-medium'>No results found for searched text "{debouncedText}"</Text>
                    </View>
                ) : null}

                {filteredMembers.length === 0 && !debouncedText.length ? (
                    <View className='flex-1 items-center justify-center'>
                        <Text className='text-gray-500 text-center font-medium'>No channel members found.</Text>
                    </View>
                ) : null}
            </KeyboardAwareScrollView>

            <Button onPress={() => router.push(`./add-new-channel-members`)} variant='primary' className='absolute bottom-10 right-10 w-12 h-12 flex flex-row items-center justify-center' style={{ backgroundColor: colors.primary, borderRadius: "50%" }}>
                <AddUserIcon width={22} height={22} fill="white" />
            </Button>
        </View>
    )
}

export default ChannelMembers