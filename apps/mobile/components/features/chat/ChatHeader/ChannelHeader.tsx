import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { useColorScheme } from '@hooks/useColorScheme'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { useState } from 'react'
import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import ChannelInfoModal from '@components/features/channel-settings/ChannelInfoModal'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg'

const ChannelHeader = ({ channelData }: { channelData: ChannelListItem }) => {

    const { colors } = useColorScheme()
    const [isModalVisible, setModalVisible] = useState(false)
    const handleOnTitlePress = () => {
        setModalVisible(true)
    }

    return (
        <>
            {/* Importing TouchableOpacity from @gorhom/bottom-sheet so that it works on android
            + does not center align the text anywhere else */}
            <TouchableOpacity
                onPress={handleOnTitlePress}
                className='flex-1'
                activeOpacity={0.5}>
                <View className='flex-row items-center rounded-md p-1 gap-1.5'>
                    <ChannelIcon type={channelData.type} fill={colors.foreground} />
                    <Text className='text-base font-semibold'>{channelData.channel_name}</Text>
                    <ChevronDownIcon height={22} width={22} fill={colors.icon} />
                </View>
            </TouchableOpacity>
            <ChannelInfoModal
                channel={channelData}
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible} />
        </>
    )
}

export default ChannelHeader