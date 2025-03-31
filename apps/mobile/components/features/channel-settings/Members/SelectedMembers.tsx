import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import UserAvatar from '@components/layout/UserAvatar';
import { Divider } from '@components/layout/Divider';
import { useColorScheme } from '@hooks/useColorScheme';
import { COLORS } from '@theme/colors';

interface SelectedMembersProps {
    selectedMembers: Member[]
    handleRemoveMember: (member: Member) => void
}

const SelectedMembers: React.FC<SelectedMembersProps> = ({ selectedMembers, handleRemoveMember }) => {
    const { isDarkColorScheme } = useColorScheme()
    return (
        <>
            {selectedMembers.length ? (
                <>
                    <View className='flex-1 px-4 pt-3 pb-2 items-center flex-wrap inset-0'>
                        <Animated.FlatList
                            itemLayoutAnimation={LinearTransition}
                            data={selectedMembers}
                            horizontal
                            renderItem={({ item }) => (
                                <Animated.View entering={ZoomIn} exiting={ZoomOut.duration(300)}>
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => handleRemoveMember(item as Member)} className='relative mr-4 mb-1.5'>
                                        <UserAvatar
                                            key={item.name}
                                            src={item.user_image ?? ""}
                                            alt={item.full_name ?? ""}
                                            availabilityStatus={item.availability_status}
                                            avatarProps={{ className: "w-10 h-10" }}
                                        />
                                        <View className='w-4 h-4 absolute -bottom-1.5 -right-1.5 items-center justify-center rounded-full border border-card bg-slate-800 dark:bg-slate-300 z-1'>
                                            <CrossIcon color={isDarkColorScheme ? COLORS.black : COLORS.white} height={11} width={11} />
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
    )
}

export default SelectedMembers