import * as ContextMenu from 'zeego/context-menu';
import { Alert, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ChannelIcon } from './ChannelIcon';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { router } from 'expo-router';
import { ChannelListContext, ChannelListContextType } from '@raven/lib/providers/ChannelListProvider';
import { FrappeConfig, FrappeContext, useFrappePostCall } from 'frappe-react-sdk';
import { useContext, useMemo } from 'react';
import { toast } from 'sonner-native';
import { SiteContext } from 'app/[site_id]/_layout';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import { RavenUser } from '@raven/types/Raven/RavenUser';

export function ChannelListRow({ channel }: { channel: ChannelListItem }) {

    const colors = useColorScheme()

    const handleMuteChannel = () => {
        console.log(`Muting channel: ${channel.name}`)
    }

    const { onMoveToStarred, isStarred } = useMoveToStarred(channel)

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename

    const handleCopyLink = async () => {
        try {
            const link = `https://${siteID}/chat/${channel.name}`
            await Clipboard.setStringAsync(link)
            toast.success('Channel link copied to clipboard!')
        } catch (error) {
            toast.error('Failed to copy channel link.')
        }
    }

    const { onLeaveChannel } = useLeaveChannel(channel)

    const showAlert = () =>
        Alert.alert(
            'Leave channel?',
            `Are you sure you want to leave ${channel.channel_name} channel?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: onLeaveChannel
                },
            ]
        )

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <Pressable
                    // short press -> navigate
                    onPress={() => router.push(`../chat/${channel.name}`)}
                    // long press -> show context menu
                    onLongPress={() => console.log(`channel long pressed - ${channel.name}`)}
                    // Use tailwind classes for layout and ios:active state
                    className='flex-row items-center px-3 py-2 rounded-lg ios:active:bg-linkColor'
                    // Add a subtle ripple effect on Android
                    android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                >
                    <ChannelIcon type={channel.type} fill={colors.colors.icon} />
                    <Text className="ml-2 text-base">{channel.channel_name}</Text>
                </Pressable>
            </ContextMenu.Trigger>

            <ContextMenu.Content>
                <ContextMenu.Item key="mute" onSelect={handleMuteChannel}>
                    <ContextMenu.ItemTitle>Mute channel</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: 'bell.slash',
                            pointSize: 14,
                            weight: 'semibold',
                            scale: 'medium',
                            // can also be a color string. Requires iOS 15+
                            hierarchicalColor: {
                                dark: colors.colors.icon,
                                light: colors.colors.icon,
                            },
                            // alternative to hierarchical color. Requires iOS 15+
                            paletteColors: [
                                {
                                    dark: colors.colors.icon,
                                    light: colors.colors.icon,
                                },
                            ],
                        }}
                    />
                </ContextMenu.Item>

                <ContextMenu.Item key="star" onSelect={onMoveToStarred}>
                    <ContextMenu.ItemTitle>{isStarred ? 'Remove from starred' : 'Move to starred'}</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: isStarred ? 'star.fill' : 'star',
                            pointSize: 14,
                            weight: 'semibold',
                            scale: 'medium',
                            // can also be a color string. Requires iOS 15+
                            hierarchicalColor: {
                                dark: colors.colors.icon,
                                light: colors.colors.icon,
                            },
                            // alternative to hierarchical color. Requires iOS 15+
                            paletteColors: [
                                {
                                    dark: colors.colors.icon,
                                    light: colors.colors.icon,
                                },
                            ],
                        }}
                    />
                </ContextMenu.Item>

                <ContextMenu.Item key="copy" onSelect={handleCopyLink}>
                    <ContextMenu.ItemTitle>Copy link</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: 'link',
                            pointSize: 14,
                            weight: 'semibold',
                            scale: 'medium',
                            // can also be a color string. Requires iOS 15+
                            hierarchicalColor: {
                                dark: colors.colors.icon,
                                light: colors.colors.icon,
                            },
                            // alternative to hierarchical color. Requires iOS 15+
                            paletteColors: [
                                {
                                    dark: colors.colors.icon,
                                    light: colors.colors.icon,
                                },
                            ],
                        }}
                    />
                </ContextMenu.Item>

                <ContextMenu.Item key="leave" destructive onSelect={showAlert}>
                    <ContextMenu.ItemTitle>Leave channel</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: 'rectangle.portrait.and.arrow.right',
                            pointSize: 12,
                            weight: 'semibold',
                            scale: 'medium',
                            // can also be a color string. Requires iOS 15+
                            hierarchicalColor: {
                                dark: 'red',
                                light: 'red',
                            },
                            // alternative to hierarchical color. Requires iOS 15+
                            paletteColors: [
                                {
                                    dark: 'red',
                                    light: 'red',
                                },
                            ],
                        }}
                    />
                </ContextMenu.Item>

                <ContextMenu.Arrow />
            </ContextMenu.Content>
        </ContextMenu.Root>
    )
}

const useLeaveChannel = (channel: ChannelListItem) => {

    const { call, error } = useFrappePostCall("raven.api.raven_channel.leave_channel")
    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const onLeaveChannel = async () => {
        return call({ channel_id: channel?.name })
            .then(() => {
                toast.success(`You have left ${channel.channel_name} channel`)
                mutate()
            })
            .catch(() => {
                toast.error('Could not leave channel', {
                    description: error?.httpStatusText
                })
            })
    }

    return { onLeaveChannel }
}

const useMoveToStarred = (channel: ChannelListItem) => {

    const { myProfile, mutate } = useCurrentRavenUser()

    const isStarred = useMemo(() => {
        if (myProfile) {
            return myProfile.pinned_channels?.map(pin => pin.channel_id).includes(channel.name)
        } else {
            return false
        }
    }, [channel.name, myProfile])

    const { call } = useContext(FrappeContext) as FrappeConfig

    const onMoveToStarred = async () => {
        call.post('raven.api.raven_channel.toggle_pinned_channel', {
            channel_id: channel.name
        }).then((res: { message: RavenUser }) => {
            toast.success(`${channel.channel_name} ${isStarred ? 'removed from starred' : 'added to starred'}`)
            if (res.message) {
                mutate({ message: res.message }, { revalidate: false })
            }
        })
    }

    return { onMoveToStarred, isStarred }
}