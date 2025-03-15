import { router, useLocalSearchParams } from 'expo-router'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { Alert } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

const LeaveThread = () => {

    const { id: threadID } = useLocalSearchParams()
    const { onLeaveThread } = useLeaveThread({ threadID: threadID as string })

    const showLeaveThreadAlert = () =>
        Alert.alert(
            'Leave thread?',
            `Are you sure you want to leave this thread?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: onLeaveThread
                },
            ]
        )

    return (
        <DropdownMenu.Item key="leave-thread" onSelect={showLeaveThreadAlert}>
            <DropdownMenu.ItemIcon ios={{
                name: 'rectangle.portrait.and.arrow.right',
                pointSize: 14,
                scale: 'medium',
                hierarchicalColor: {
                    dark: 'red',
                    light: 'red',
                },
            }} />
            <DropdownMenu.ItemTitle >Leave</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
    )
}

const useLeaveThread = ({ threadID }: { threadID: string }) => {

    const { call, error } = useFrappePostCall('raven.api.raven_channel.leave_channel')
    const { mutate } = useSWRConfig()

    const onLeaveThread = async () => {
        return call({ channel_id: threadID })
            .then(() => {
                toast.success(`You have left the thread`)
                router.back()
                mutate(["channel_members", threadID])
            })
            .catch(() => {
                toast.error('Could not leave thread', {
                    description: error?.httpStatusText
                })
            })
    }

    return { onLeaveThread }
}

export default LeaveThread