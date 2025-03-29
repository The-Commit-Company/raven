import { TouchableOpacity, View, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@components/nativewindui/Text';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import SettingsIcon from '@assets/icons/SettingsIcon.svg';
import MembersIcon from '@assets/icons/MembersIcon.svg';
import HollowFilesIcon from '@assets/icons/HollowFilesIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Divider } from '@components/layout/Divider';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { ChannelIcon } from '../channels/ChannelList/ChannelIcon';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import PinOutlineIcon from '@assets/icons/PinOutlineIcon.svg';

type ChannelInfoModalProps = {
    channel: ChannelListItem
    isModalVisible: boolean
    setModalVisible: (visible: boolean) => void
}

const ChannelInfoModal = ({ channel, isModalVisible, setModalVisible }: ChannelInfoModalProps) => {

    // Animation values
    const modalHeight = useSharedValue(0)
    const modalOpacity = useSharedValue(0)

    const handleCloseModal = () => {
        // Animate out
        modalHeight.value = withTiming(0, { duration: 100, easing: Easing.out(Easing.ease) });
        modalOpacity.value = withTiming(0, { duration: 100 });
        setTimeout(() => setModalVisible(false), 100)
    }

    const handleGoToSettings = () => {
        setModalVisible(false)
        router.push('./channel-settings', {
            relativeToDirectory: true
        })
    }

    const handleGoToViewMembers = () => {
        setModalVisible(false)
        router.push('./channel-members', {
            relativeToDirectory: true
        })
    }

    const handleGoToPins = () => {
        setModalVisible(false)
        router.push('./pinned-messages', {
            relativeToDirectory: true
        })
    }

    const handleGoToSharedMedia = () => {
        setModalVisible(false)
        router.push('./view-media', {
            relativeToDirectory: true
        })
    }

    // Animated styles for the modal
    const animatedModalStyle = useAnimatedStyle(() => {
        return {
            height: modalHeight.value,
            opacity: modalOpacity.value,
        }
    })

    // Start animation when modal becomes visible
    useEffect(() => {
        if (isModalVisible) {
            modalHeight.value = withTiming(252, { duration: 250, easing: Easing.out(Easing.ease) })
            modalOpacity.value = withTiming(1, { duration: 250 })
        }
    }, [isModalVisible])

    const { colors } = useColorScheme()

    const pinnedMessages = channel.pinned_messages_string ? channel.pinned_messages_string.split('\n').length : 0

    return (
        <Modal
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleCloseModal}>
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={handleCloseModal}>
                <Animated.View style={[styles.modalContent, animatedModalStyle]} className='bg-card dark:border dark:border-border'>
                    <ModalHeader channel={channel} handleCloseModal={handleCloseModal} />
                    <Divider className='my-2 mx-1' prominent />
                    <Pressable onPress={handleGoToViewMembers}
                        className='rounded-xl ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <View className='flex-row items-center justify-between px-2'>
                            <View className='flex-row items-center'>
                                <MembersIcon height={20} width={20} color={colors.foreground} />
                                <Text style={styles.modalOption}>Members</Text>
                            </View>
                            <ChevronRightIcon height={24} width={24} fill={colors.foreground} strokeWidth={'1px'} />
                        </View>
                    </Pressable>
                    <Pressable onPress={handleGoToSettings}
                        className='rounded-xl ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <View className='flex-row items-center justify-between px-2'>
                            <View className='flex-row items-center'>
                                <SettingsIcon height={20} width={20} color={colors.foreground} />
                                <Text style={styles.modalOption}>Settings & Details</Text>
                            </View>
                            <ChevronRightIcon height={24} width={24} fill={colors.foreground} strokeWidth={'1px'} />
                        </View>
                    </Pressable>
                    <Pressable onPress={handleGoToPins}
                        className='rounded-xl ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <View className='flex-row items-center justify-between px-2'>
                            <View className='flex-row items-center'>
                                <PinOutlineIcon height={20} width={20} stroke={colors.foreground} />
                                <Text style={styles.modalOption}>Pins</Text>
                            </View>
                            <View className='flex-row items-center gap-1'>
                                {pinnedMessages > 0 ?
                                    <Text className='text-sm text-foreground font-semibold'>{pinnedMessages}</Text>
                                    : null
                                }
                                <ChevronRightIcon height={24} width={24} fill={colors.foreground} strokeWidth={'1px'} />
                            </View>
                        </View>
                    </Pressable>
                    <Pressable onPress={handleGoToSharedMedia}
                        className='rounded-xl ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <View className='flex-row items-center justify-between px-2'>
                            <View className='flex-row items-center'>
                                <HollowFilesIcon height={20} width={20} fill={colors.foreground} />
                                <Text style={styles.modalOption}>Images and Files</Text>
                            </View>
                            <ChevronRightIcon height={24} width={24} fill={colors.foreground} strokeWidth={'1px'} />
                        </View>
                    </Pressable>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    )
}

const ModalHeader = ({ channel, handleCloseModal }: { channel: ChannelListItem, handleCloseModal: () => void }) => {
    const { colors } = useColorScheme()
    return (
        <View className='flex-row items-center justify-between p-2'>
            <View className='flex-row items-center'>
                <TouchableOpacity onPress={handleCloseModal} hitSlop={10}>
                    <CrossIcon height={20} width={20} color={colors.foreground} />
                </TouchableOpacity>
                {channel && <View className='flex-row items-center ml-3'>
                    <ChannelIcon type={channel.type} fill={colors.foreground} />
                    <Text className='ml-2 text-base font-semibold'>{channel.channel_name}</Text>
                </View>}
            </View>
            {/* <TouchableOpacity hitSlop={10}>
                <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
            </TouchableOpacity> */}
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: Platform.OS === 'ios' ? 60 : 8,
    },
    modalContent: {
        width: '95%',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        overflow: 'hidden',
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.5)',
    },
    modalOption: {
        padding: 10,
        fontSize: 16,
    }
})


export default ChannelInfoModal