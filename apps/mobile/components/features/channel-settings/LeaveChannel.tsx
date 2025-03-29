import { Text } from '@components/nativewindui/Text';
import { FrappeDoc, useFrappePostCall } from 'frappe-react-sdk';
import { useContext } from 'react';
import { ChannelListContext, ChannelListContextType } from '@raven/lib/providers/ChannelListProvider';
import { toast } from 'sonner-native';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { Alert, Pressable } from 'react-native';
import LeaveIcon from "@assets/icons/LeaveIcon.svg";
import { useColorScheme } from '@hooks/useColorScheme';
import { useRouteToHome } from '@hooks/useRouting';

const LeaveChannel = ({ channel }: { channel: FrappeDoc<ChannelListItem> | undefined }) => {

    const { call, error } = useFrappePostCall("raven.api.raven_channel.leave_channel")
    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { colors } = useColorScheme()

    const goToHome = useRouteToHome()

    const onLeaveChannel = async () => {
        return call({ channel_id: channel?.name })
            .then(() => {
                toast.success(`You have left ${channel?.channel_name} channel`)
                goToHome()
                mutate()
            })
            .catch(() => {
                toast.error('Could not leave channel', {
                    description: error?.httpStatusText
                })
            })
    }

    const onLeaveChannelPressed = () => {
        Alert.alert('Leave channel?', `Are you sure you want to leave ${channel?.channel_name} channel?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Leave', style: 'destructive', onPress: onLeaveChannel },
        ])
    }

    return (
        <Pressable
            onPress={onLeaveChannelPressed}
            className='flex flex-row items-center py-3 px-4 rounded-xl gap-3 bg-background dark:bg-card ios:active:bg-red-50 dark:ios:active:bg-red-100/10'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <LeaveIcon height={18} width={18} fill={colors.destructive} />
            <Text className="text-base text-destructive">Leave Channel</Text>
        </Pressable>
    )
}

export default LeaveChannel