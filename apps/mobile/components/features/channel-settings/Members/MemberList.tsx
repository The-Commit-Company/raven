import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { configureReanimatedLogger, ZoomIn, ZoomOut } from 'react-native-reanimated';
import CheckIcon from "@assets/icons/CheckIcon.svg";
import { UserFields } from '@raven/types/common/UserFields';
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import UserAvatar from '@components/layout/UserAvatar';
import { Text } from '@components/nativewindui/Text';
import { Divider } from '@components/layout/Divider';
import { COLORS } from '@theme/colors';
import { useColorScheme } from '@hooks/useColorScheme';

interface MemberListProps {
    filteredMembers: UserFields[];
    selectedMembers: Member[];
    handleSelectMember: (member: Member) => void;
    debouncedText: string;
}

configureReanimatedLogger({
    strict: false,
})

const MemberList: React.FC<MemberListProps> = ({ filteredMembers, selectedMembers, handleSelectMember, debouncedText }) => {
    const { isDarkColorScheme } = useColorScheme()
    return (
        <FlashList
            data={filteredMembers}
            renderItem={({ item }) => {
                const isMemberSelected = selectedMembers.find(member => member.name === item.name);
                return (
                    <Pressable onPress={() => handleSelectMember(item as Member)} className='ios:active:bg-background dark:ios:active:bg-linkColor flex-row items-center justify-between rounded-lg px-2.5'>
                        <View className='gap-3 px-2 py-2.5 flex-row items-center'>
                            <View className='relative'>
                                <UserAvatar
                                    src={item.user_image ?? ""}
                                    alt={item.full_name ?? ""}
                                    availabilityStatus={item.availability_status}
                                />
                                <View>
                                    {isMemberSelected && (
                                        <Animated.View entering={ZoomIn} exiting={ZoomOut} className='w-4 h-4 absolute -bottom-1.5 -right-1.5 items-center justify-center rounded-full border border-card bg-green z-1'>
                                            <CheckIcon fill={isDarkColorScheme ? COLORS.black : COLORS.white} height={11} width={11} />
                                        </Animated.View>
                                    )}
                                </View>
                            </View>
                            <View className='flex-col gap-0.5 justify-center'>
                                <Text className='text-foreground font-medium text-[15px]'>{item.full_name}</Text>
                                <Text className='text-muted-foreground text-sm'>{item.name}</Text>
                            </View>
                        </View>
                    </Pressable>
                )
            }}
            keyExtractor={(item) => item.name}
            estimatedItemSize={64}
            ItemSeparatorComponent={() => <Divider className='mx-0' />}
            bounces={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={!debouncedText.length ? () => (
                <View className="flex-1 items-center justify-center" style={{ height: Dimensions.get("screen").height - 200 }}>
                    <Text className="text-[15px] text-center text-muted-foreground">
                        No channel members found.
                    </Text>
                </View>
            ) : undefined}
        />
    )
}

export default MemberList