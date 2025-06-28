import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import { cn } from '@lib/cn';
import { COLORS } from '@theme/colors';
import BookmarkIcon from '@assets/icons/BookmarkIcon.svg';
import { router } from 'expo-router';
import { useFrappeEventListener } from 'frappe-react-sdk';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Badge } from '@components/nativewindui/Badge';

export function ViewSavedMessagesButton() {

    const { data: reminders, mutate } = useFrappeGetCall('raven.api.reminder.get_overdue_reminders', undefined, undefined, {
        revalidateOnFocus: true,
        focusThrottleInterval: 1000 * 60 * 5,
    })

    useFrappeEventListener('due_reminders', () => {
        mutate()
    })

    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                className="items-center justify-center"
                key={"view-saved-messages"}
                entering={ZoomInRotate}>
                <Pressable
                    hitSlop={10}
                    onPress={() => {
                        router.push('../home/saved-messages', { relativeToDirectory: true })
                    }}
                    className="opacity-80">
                    {({ pressed }) => (
                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                            <BookmarkIcon fill={COLORS.white} width={19} height={19} />
                            {reminders && reminders?.message.length > 0 && <Badge maxCount={9} textVariant="caption2">{reminders?.message.length}</Badge>}
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </LayoutAnimationConfig>
    )
}