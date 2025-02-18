import { TouchableOpacity, View, StyleSheet, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@components/nativewindui/Text';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import SettingsIcon from '@assets/icons/SettingsIcon.svg';
import MembersIcon from '@assets/icons/MembersIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Divider } from '@components/layout/Divider';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { ChannelIcon } from '../channels/ChannelList/ChannelIcon';
import ThreeHorizontalDots from '@assets/icons/ThreeHorizontalDots.svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';

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
            modalHeight.value = withTiming(165, { duration: 250, easing: Easing.out(Easing.ease) })
            modalOpacity.value = withTiming(1, { duration: 250 })
        }
    }, [isModalVisible])

    const colors = useColorScheme()

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
                                <MembersIcon height={20} width={20} color={colors.colors.foreground} />
                                <Text style={styles.modalOption}>Members</Text>
                            </View>
                            <ChevronRightIcon height={24} width={24} fill={colors.colors.foreground} strokeWidth={'1px'} />
                        </View>
                    </Pressable>
                    <Pressable onPress={handleGoToSettings}
                        className='rounded-xl ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <View className='flex-row items-center justify-between px-2'>
                            <View className='flex-row items-center'>
                                <SettingsIcon height={20} width={20} color={colors.colors.foreground} />
                                <Text style={styles.modalOption}>Settings & Details</Text>
                            </View>
                            <ChevronRightIcon height={24} width={24} fill={colors.colors.foreground} strokeWidth={'1px'} />
                        </View>
                    </Pressable>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    )
}

const ModalHeader = ({ channel, handleCloseModal }: { channel: ChannelListItem, handleCloseModal: () => void }) => {
    const colors = useColorScheme()
    return (
        <View className='flex-row items-center justify-between p-2'>
            <View className='flex-row items-center'>
                <TouchableOpacity onPress={handleCloseModal} hitSlop={10}>
                    <CrossIcon height={20} width={20} color={colors.colors.foreground} />
                </TouchableOpacity>
                {channel && <View className='flex-row items-center ml-3'>
                    <ChannelIcon type={channel.type} fill={colors.colors.foreground} />
                    <Text className='ml-2 text-base font-semibold'>{channel.channel_name}</Text>
                </View>}
            </View>
            <TouchableOpacity hitSlop={10}>
                <ThreeHorizontalDots height={20} width={20} color={colors.colors.foreground} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 60,
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