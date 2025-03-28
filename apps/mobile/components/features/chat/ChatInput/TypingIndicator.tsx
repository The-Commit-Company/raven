import useTypingIndicator from '@raven/lib/hooks/useTypingIndicator'
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
    FadeOutDown,
    FadeInDown
} from 'react-native-reanimated'
import { useMemo } from 'react'

type Props = {
    channel: string
}

const TypingIndicator = ({ channel }: Props) => {
    const typingUsers = useTypingIndicator(channel)
    const userRecords = useGetUserRecords()
    const { myProfile: currentUser } = useCurrentRavenUser()

    const typingString = useMemo(() => {

        const validTypingUsers = typingUsers.filter((user) => user !== currentUser?.name).map((user) => userRecords[user]?.first_name ?? userRecords[user]?.full_name ?? user)

        if (validTypingUsers.length === 0) return ''

        if (validTypingUsers.length === 1) return validTypingUsers[0] + ' is typing...'

        if (validTypingUsers.length === 2) return validTypingUsers[0] + ' and ' + validTypingUsers[1] + ' are typing...'

        if (validTypingUsers.length === 3) return validTypingUsers[0] + ', ' + validTypingUsers[1] + ' and 1 other are typing...'

        return validTypingUsers[0] + ', ' + validTypingUsers[1] + ' and ' + (validTypingUsers.length - 2) + ' others are typing...'


    }, [typingUsers, userRecords, currentUser?.name])

    const dot1Style = useAnimatedStyle(() => {
        return {
            opacity: withDelay(
                0,
                withRepeat(
                    withSequence(
                        withTiming(0.5, { duration: 450, easing: Easing.ease }),
                        withTiming(1, { duration: 450, easing: Easing.ease })
                    ),
                    -1,
                    true
                )),
            transform: [
                {
                    scale: withDelay(
                        0,
                        withRepeat(
                            withSequence(
                                withTiming(0.8, { duration: 450, easing: Easing.ease }),
                                withTiming(1, { duration: 450, easing: Easing.ease })
                            ),
                            -1,
                            true
                        )
                    )
                }
            ]
        }
    })

    const dot2Style = useAnimatedStyle(() => {
        return {
            opacity: withDelay(
                150,
                withRepeat(
                    withSequence(
                        withTiming(0.5, { duration: 450, easing: Easing.ease }),
                        withTiming(1, { duration: 450, easing: Easing.ease })
                    ),
                    -1,
                    true
                )),
            transform: [
                {
                    scale: withDelay(
                        150,
                        withRepeat(
                            withSequence(
                                withTiming(0.8, { duration: 450, easing: Easing.ease }),
                                withTiming(1, { duration: 450, easing: Easing.ease })
                            ),
                            -1,
                            true
                        )
                    )
                }
            ]
        }
    })

    const dot3Style = useAnimatedStyle(() => {
        return {
            opacity: withDelay(
                300,
                withRepeat(
                    withSequence(
                        withTiming(0.5, { duration: 450, easing: Easing.ease }),
                        withTiming(1, { duration: 450, easing: Easing.ease })
                    ),
                    -1,
                    true
                )),
            transform: [
                {
                    scale: withDelay(
                        300,
                        withRepeat(
                            withSequence(
                                withTiming(0.8, { duration: 450, easing: Easing.ease }),
                                withTiming(1, { duration: 450, easing: Easing.ease })
                            ),
                            -1,
                            true
                        )
                    )
                }
            ]
        }
    })

    if (typingString === '') return null

    return (
        <Animated.View
            className='flex flex-row gap-2 px-4 pt-1 items-center bg-background'
            entering={FadeInDown}
            exiting={FadeOutDown}>
            <View className="flex flex-row gap-1 items-center py-1 rounded-full">
                <Animated.View
                    className="w-2 h-2 bg-muted rounded-full"
                    style={dot1Style}
                />
                <Animated.View
                    className="w-2 h-2 bg-muted rounded-full"
                    style={dot2Style}
                />
                <Animated.View
                    className="w-2 h-2 bg-muted rounded-full"
                    style={dot3Style}
                />
            </View>
            <Text className='text-sm text-muted-foreground'>{typingString}</Text>
        </Animated.View>
    )
}

export default TypingIndicator