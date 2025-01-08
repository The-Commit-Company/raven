import * as ContextMenu from 'zeego/context-menu';
import { Pressable } from 'react-native';
import { ChannelIcon } from './ChannelIcon';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { router } from 'expo-router';

export function ChannelListRow({ channel }: { channel: ChannelListItem }) {

    const colors = useColorScheme()

    const handleMuteChannel = () => {
        console.log(`Muting channel: ${channel.name}`)
    }

    const handleMoveToStarred = () => {
        console.log(`Moving channel to starred: ${channel.name}`)
    }

    const handleCopyLink = () => {
        console.log(`Copying link for: ${channel.name}`)
    }

    const handleLeaveChannel = () => {
        console.log(`Leaving channel: ${channel.name}`)
    }

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

                <ContextMenu.Item key="star" onSelect={handleMoveToStarred}>
                    <ContextMenu.ItemTitle>Move to starred</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: 'star',
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

                <ContextMenu.Item key="leave" onSelect={handleLeaveChannel} destructive>
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