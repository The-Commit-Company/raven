import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { useColorScheme } from '@hooks/useColorScheme'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import ChannelInfoModal from '@components/features/channel-settings/ChannelInfoModal'

const ChannelHeader = ({ channelData }: { channelData: ChannelListItem }) => {

    const colors = useColorScheme()
    const [isModalVisible, setModalVisible] = useState(false)
    const handleOnTitlePress = () => {
        setModalVisible(true)
    }

    return (
        <>
            <TouchableOpacity
                onPress={handleOnTitlePress}
                className='flex-1'
                activeOpacity={0.5}>
                <View className='flex-row items-center rounded-md p-1'>
                    <ChannelIcon type={channelData.type} fill={colors.colors.foreground} />
                    <Text className='ml-2 text-base font-semibold'>{channelData.channel_name}</Text>
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