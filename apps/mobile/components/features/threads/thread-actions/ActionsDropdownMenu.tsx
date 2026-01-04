import { TouchableOpacity } from 'react-native'
import ThreeHorizontalDots from '@assets/icons/ThreeHorizontalDots.svg'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { Member } from '@raven/lib/hooks/useFetchChannelMembers';
import { Alert } from 'react-native'
import { useFrappeDeleteDoc, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk';
import { toast } from 'sonner-native';
import { router } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

const ActionsDropdownMenu = ({ threadID, channelMember }: { threadID: string, channelMember: Member }) => {
    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const onToggleThreadNotifications = useToggleThreadNotifications(threadID, channelMember)

    const onLeaveThread = useLeaveThread(threadID)
    const showLeaveThreadAlert = () =>
        Alert.alert(
            t('threads.leaveThread'),
            t('threads.leaveThreadMessage'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.leave'),
                    style: 'destructive',
                    onPress: onLeaveThread
                },
            ]
        )

    const onDeleteThread = useDeleteThread(threadID)
    const showDeleteThreadAlert = () =>
        Alert.alert(
            t('threads.deleteThread'),
            t('threads.deleteThreadMessage'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.delete'),
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
                        {channelMember?.allow_notifications ? t('common.unmute') : t('common.mute')}
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
                    <DropdownMenu.ItemTitle >{t('common.leave')}</DropdownMenu.ItemTitle>
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
                    <DropdownMenu.ItemTitle>{t('common.delete')}</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

const useToggleThreadNotifications = (threadID: string, channelMember: Member) => {

    const { t } = useTranslation()
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

            toast.success(channelMember?.allow_notifications ? t('threads.threadUnmuted') : t('threads.threadMuted'))
        }).catch(() => {
            toast.error(t('threads.muteThreadFailed'), {
                description: error?.httpStatusText
            })
        })
    }

    return onToggle
}

const useLeaveThread = (threadID: string) => {

    const { t } = useTranslation()
    const { call, error } = useFrappePostCall('raven.api.raven_channel.leave_channel')
    const { mutate } = useSWRConfig()

    const onLeaveThread = async () => {
        return call({ channel_id: threadID })
            .then(() => {
                toast.success(t('threads.leftThread'))
                router.back()
                mutate(["channel_members", threadID])
            })
            .catch(() => {
                toast.error(t('threads.leaveThreadFailed'), {
                    description: error?.httpStatusText
                })
            })
    }

    return onLeaveThread
}

const useDeleteThread = (threadID: string) => {

    const { t } = useTranslation()
    const { deleteDoc, error } = useFrappeDeleteDoc()

    const onDeleteThread = async () => {
        return deleteDoc('Raven Channel', threadID)
            .then(() => {
                toast.success(t('threads.threadDeleted'))
                router.back()
            })
            .catch(() => {
                toast.error(t('threads.deleteThreadFailed'), {
                    description: error?.httpStatusText
                })
            })
    }

    return onDeleteThread
}

export default ActionsDropdownMenu