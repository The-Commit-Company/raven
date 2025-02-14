import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import UserAvatar from '@components/layout/UserAvatar';
import { Divider } from '@components/layout/Divider';

interface SelectedMembersProps {
    selectedMembers: Member[];
    handleDeleteMember: (member: Member) => void;
}

const SelectedMembers: React.FC<SelectedMembersProps> = ({ selectedMembers, handleDeleteMember }) => {
    return (
        <>
            {selectedMembers.length ? (
                <>
                    <View className='flex-1 p-2.5 py-3 items-center flex-wrap inset-0'>
                        <Animated.FlatList
                            itemLayoutAnimation={LinearTransition}
                            data={selectedMembers}
                            horizontal
                            renderItem={({ item }) => (
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
                            )}
                            keyExtractor={(item) => item.name}
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    <Divider className='mx-0' />
                </>
            ) : null}
        </>
    );
};

export default SelectedMembers; 