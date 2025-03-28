import { Message } from "@raven/types/common/Message"
import { View } from "react-native"
import { Text } from '@components/nativewindui/Text'
import { formatDateAndTime } from "@raven/lib/utils/dateConversions"
import { BaseMessageItem } from "../chat-stream/BaseMessageItem"
import * as ContextMenu from 'zeego/context-menu';
import { useColorScheme } from "@hooks/useColorScheme";
import { useTogglePinMessage } from "@hooks/useTogglePinMessage"

const PinnedMessageItem = ({ message }: { message: Message }) => {

    const { colors } = useColorScheme()

    const { TogglePin } = useTogglePinMessage({ ...message, is_pinned: 1 })

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <View>
                    <View className='flex flex-row items-center px-3 pt-2 gap-2'>
                        <Text className='text-[13px] text-muted-foreground'>
                            {formatDateAndTime(message.creation)}
                        </Text>
                    </View>
                    <BaseMessageItem message={message} />
                </View>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item key="unpin" onSelect={TogglePin}>
                    <ContextMenu.ItemTitle>Unpin message</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                        ios={{
                            name: 'pin.slash',
                            pointSize: 14,
                            weight: 'semibold',
                            scale: 'medium',
                            // can also be a color string. Requires iOS 15+
                            hierarchicalColor: {
                                dark: colors.icon,
                                light: colors.icon,
                            },
                            // alternative to hierarchical color. Requires iOS 15+
                            paletteColors: [
                                {
                                    dark: colors.icon,
                                    light: colors.icon,
                                },
                            ],
                        }}
                    />
                </ContextMenu.Item>
            </ContextMenu.Content>
        </ContextMenu.Root>
    )
}

export default PinnedMessageItem