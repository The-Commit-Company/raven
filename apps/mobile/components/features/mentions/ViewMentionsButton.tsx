import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import { cn } from '@lib/cn';
import { COLORS } from '@theme/colors';
import { Badge } from '@components/nativewindui/Badge';
import AtSignIcon from '@assets/icons/AtSignIcon.svg';
import { router } from 'expo-router';
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk';

export function ViewMentionsButton() {

    const { data: mentionsCount, mutate } = useFrappeGetCall<{ message: number }>('raven.api.mentions.get_unread_mention_count', undefined, undefined, {
        revalidateOnFocus: true,
        focusThrottleInterval: 1000 * 60 * 5,
    })

    useFrappeEventListener('raven_mention', () => {
        mutate()
    })

    const onViewMentions = () => {
        mutate({ message: 0 }, { revalidate: false })
        router.push('../home/mentions', { relativeToDirectory: true })
    }

    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                className="items-center justify-center"
                key={"view-notifications"}
                entering={ZoomInRotate}>
                <Pressable
                    hitSlop={10}
                    onPress={onViewMentions}
                    className="opacity-80">
                    {({ pressed }) => (
                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                            <AtSignIcon color={COLORS.white} width={20} height={20} />
                            {mentionsCount && mentionsCount?.message > 0 && <Badge maxCount={9} textVariant="caption2"></Badge>}
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </LayoutAnimationConfig>
    )
}