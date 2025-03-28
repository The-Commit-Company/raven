import DMChannelInfoModal from '@components/features/channel-settings/DMChannelInfoModal'
import UserAvatar from '@components/layout/UserAvatar'
import { useIsUserActive } from '@hooks/useIsUserActive'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'

const DMChannelHeader = ({ channelData }: { channelData: DMChannelListItem }) => {

    const peer = channelData.peer_user_id
    const user = useGetUser(peer)
    const isActive = useIsUserActive(channelData.peer_user_id)

    const [isModalVisible, setModalVisible] = useState(false)

    const handleOnTitlePress = () => {
        setModalVisible(true)
    }

    return (
        <>
            <TouchableOpacity activeOpacity={0.5} className='flex-1 flex-row items-center gap-2.5' onPress={handleOnTitlePress}>
                <UserAvatar
                    src={user?.user_image ?? ''}
                    alt={user?.full_name ?? peer}
                    isActive={isActive}
                    isBot={user?.type === 'Bot'}
                    availabilityStatus={user?.availability_status}
                    avatarProps={{ className: "w-6 h-6" }}
                    fallbackProps={{ className: "rounded-[4px]" }}
                    textProps={{ className: "text-xs font-medium" }}
                    imageProps={{ className: "rounded-[4px]" }}
                    indicatorProps={{ className: "h-2 w-2" }}
                />
                <Text className='text-base font-semibold text-foreground'>{user?.full_name ?? peer}</Text>
            </TouchableOpacity>
            <DMChannelInfoModal
                channel={channelData}
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible} />
        </>
    )
}

export default DMChannelHeader