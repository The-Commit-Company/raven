import { useColorScheme } from '@hooks/useColorScheme'
import { TouchableOpacity } from 'react-native'
import ThreeHorizontalDots from '@assets/icons/ThreeHorizontalDots.svg'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { Alert } from 'react-native';
import { toast } from 'sonner-native'
import { useFrappeDeleteDoc, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { router, useLocalSearchParams } from 'expo-router'
import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useContext, useMemo } from 'react';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

const ThreadActions = () => {

    const { id: threadID } = useLocalSearchParams()
    const { colors } = useColorScheme()

    const { channelMembers } = useFetchChannelMembers(threadID as string)
    const { myProfile: user } = useCurrentRavenUser()

    const channelMember = useMemo(() => {
        if (user && channelMembers) {
            return channelMembers[user.name]
        }
        return null
    }, [user, channelMembers])

    console.log("channelMember", channelMember)

    const handleDisableNotifications = () => {
        console.log('disable notifications')
    }

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

    const { onDeleteThread } = useDeleteThread({ threadID: threadID as string })

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
                <DropdownMenu.Item key="disable-notifications" onSelect={handleDisableNotifications}>
                    <DropdownMenu.ItemIcon ios={{
                        name: 'bell.slash',
                        pointSize: 16,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'white',
                            light: 'black',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>Mute</DropdownMenu.ItemTitle>
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
                <DropdownMenu.Item key="delete-thread" onSelect={showDeleteThreadAlert}>
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
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
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

const useDeleteThread = ({ threadID }: { threadID: string }) => {

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

    return { onDeleteThread }
}

export default ThreadActions