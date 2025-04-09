import DMChannelInfoModal from '@components/features/channel-settings/DMChannelInfoModal'
import UserAvatar from '@components/layout/UserAvatar'
import { useIsUserActive } from '@hooks/useIsUserActive'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'

const DMChannelHeader = ({ channelData }: { channelData: DMChannelListItem }) => {

    const peer = channelData.peer_user_id
    const user = useGetUser(peer)
    const isActive = useIsUserActive(channelData.peer_user_id)
    const { colors } = useColorScheme()

    const [isModalVisible, setModalVisible] = useState(false)

    const handleOnTitlePress = () => {
        setModalVisible(true)
    }

    return (
        <>
            <TouchableOpacity activeOpacity={0.5} className='flex-1' onPress={handleOnTitlePress}>
                <View className='flex-row items-center rounded-md p-1 gap-2.5'>
                    <UserAvatar
                        src={user?.user_image ?? ''}
                        alt={user?.full_name ?? peer}
                        isActive={isActive}
                        availabilityStatus={user?.availability_status}
                        avatarProps={{ className: "w-6 h-6" }}
                        fallbackProps={{ className: "rounded-[4px]" }}
                        textProps={{ className: "text-xs font-medium" }}
                        imageProps={{ className: "rounded-[4px]" }}
                        indicatorProps={{ className: "h-2 w-2" }}
                    />
                    <View className='flex-row items-center gap-1.5'>
                        <Text className='text-base font-semibold text-foreground'>{user?.full_name ?? peer}</Text>
                        {user?.type === 'Bot' ? <Text className='text-xs bg-card-background font-medium text-foreground/65 rounded-md px-1.5 py-0.5'>{user?.type}</Text> : null}
                        <ChevronDownIcon height={22} width={22} fill={colors.icon} />
                    </View>
                </View>

            </TouchableOpacity>
            <DMChannelInfoModal
                channel={channelData}
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible} />
        </>
    )
}

export default DMChannelHeader