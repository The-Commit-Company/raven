import { Alert } from '@components/nativewindui/Alert';
import { Text } from '@components/nativewindui/Text';
import { FrappeDoc, useFrappePostCall } from 'frappe-react-sdk';
import { useContext } from 'react';
import { ChannelListContext, ChannelListContextType } from '@raven/lib/providers/ChannelListProvider';
import { toast } from 'sonner-native';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { Pressable } from 'react-native';
import LeaveIcon from "@assets/icons/LeaveIcon.svg";
import { useColorScheme } from '@hooks/useColorScheme';
import { StyleSheet } from 'react-native';
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

    return (
        <Alert
            title="Leave channel?"
            message={`Are you sure you want to leave ${channel?.channel_name} channel?`}
            buttons={
                [
                    {
                        text: 'Cancel',
                    },
                    {
                        text: 'Leave',
                        style: 'destructive',
                        onPress: onLeaveChannel
                    },
                ]} >
            <Pressable
                style={styles.settingsContainer}
                className='rounded-xl ios:active:bg-linkColor border border-border'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <LeaveIcon height={20} width={20} fill={colors.icon} />
                <Text className="text-base">Leave Channel</Text>
            </Pressable>
        </Alert>
    )
}

const styles = StyleSheet.create({
    settingsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12
    }
})

export default LeaveChannel