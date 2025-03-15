import { TouchableOpacity } from 'react-native'
import ThreeHorizontalDots from '@assets/icons/ThreeHorizontalDots.svg'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import { Alert } from 'react-native'
import { useFrappeDeleteDoc, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk';
import { toast } from 'sonner-native';
import { router } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';

const ActionsDropdownMenu = ({ threadID, channelMember }: { threadID: string, channelMember: Member }) => {

    const { colors } = useColorScheme()

    const onToggleThreadNotifications = useToggleThreadNotifications(threadID, channelMember)

    const onLeaveThread = useLeaveThread(threadID)
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

    const onDeleteThread = useDeleteThread(threadID)
    const showDeleteThreadAlert = () =>
        Alert.alert(
            'Delete thread?',
            `Are you sure you want to delete this thread?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDeleteThread
                },
            ]
        )

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity hitSlop={10} >
                    <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item key="disable-notifications" onSelect={onToggleThreadNotifications}>
                    <DropdownMenu.ItemIcon ios={{
                        name: channelMember?.allow_notifications ? 'bell.slash' : 'bell',
                        pointSize: 16,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'white',
                            light: 'black',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>
                        {channelMember?.allow_notifications ? 'Unmute' : 'Mute'}
                    </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
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
                {/* Only admins can delete threads */}
                {channelMember.is_admin && <DropdownMenu.Item key="delete-thread" onSelect={showDeleteThreadAlert}>
                    <DropdownMenu.ItemIcon ios={{
                        name: 'trash',
                        pointSize: 14,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'red',
                            light: 'red',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>Delete</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

const useToggleThreadNotifications = (threadID: string, channelMember: Member) => {

    const { mutate } = useSWRConfig()
    const { call, error } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

    const onToggle = async () => {
        return call({
            member: channelMember?.channel_member_name,
            allow_notifications: channelMember?.allow_notifications ? 0 : 1
        }).then((res) => {
            if (res && res.message) {
                mutate(["channel_members", threadID], (existingMembers: any) => {
                    return {
                        message: {
                            ...existingMembers.message,
                            [channelMember.name]: {
                                ...existingMembers.message[channelMember.name],
                                allow_notifications: res.message.allow_notifications
                            }
                        }
                    }
                }, {
                    revalidate: false
                })
            }

            toast.success(`Thread ${channelMember?.allow_notifications ? 'unmuted' : 'muted'}`)
        }).catch(() => {
            toast.error('Could not toggle thread notifications', {
                description: error?.httpStatusText
            })
        })
    }

    return onToggle
}

const useLeaveThread = (threadID: string) => {

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

    return onLeaveThread
}

const useDeleteThread = (threadID: string) => {

    const { deleteDoc, error } = useFrappeDeleteDoc()

    const onDeleteThread = async () => {
        return deleteDoc('Raven Channel', threadID)
            .then(() => {
                toast.success(`Thread has been deleted.`)
                router.back()
            })
            .catch(() => {
                toast.error('Could not delete thread', {
                    description: error?.httpStatusText
                })
            })
    }

    return onDeleteThread
}

export default ActionsDropdownMenu