import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import CheckIcon from "@assets/icons/CheckIcon.svg";
import { UserFields } from '@raven/types/common/UserFields';
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import UserAvatar from '@components/layout/UserAvatar';
import { Text } from '@components/nativewindui/Text';
import { Divider } from '@components/layout/Divider';

interface MemberListProps {
    filteredMembers: UserFields[];
    selectedMembers: Member[];
    handleSelectMember: (member: Member) => void;
    debouncedText: string;
}

const MemberList: React.FC<MemberListProps> = ({ filteredMembers, selectedMembers, handleSelectMember, debouncedText }) => {
    return (
        <FlashList
            data={filteredMembers}
            renderItem={({ item }) => {
                const isMemberSelected = selectedMembers.find(member => member.name === item.name);

                return (
                    <TouchableOpacity activeOpacity={0.6} onPress={() => handleSelectMember(item as Member)} className='flex-row items-center justify-between rounded-md px-2.5'>
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
                );
            }}
            keyExtractor={(item) => item.name}
            estimatedItemSize={64}
            ItemSeparatorComponent={() => <Divider className='mx-0' />}
            bounces={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={!debouncedText.length ? () => (
                <View className="flex-1 items-center justify-center" style={{ height: Dimensions.get("screen").height - 200 }}>
                    <Text className="text-gray-500 text-center font-medium">
                        No channel members found.
                    </Text>
                </View>
            ) : undefined}
        />
    );
};

export default MemberList; 