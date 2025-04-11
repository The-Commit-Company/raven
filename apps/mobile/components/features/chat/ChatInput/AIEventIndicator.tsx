import SpinningLoader from '@components/layout/SpinningLoader'
import { Text } from '@components/nativewindui/Text'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
import Animated, {
    FadeOutDown,
    FadeInDown
} from 'react-native-reanimated'

type Props = {
    channelID: string
}

const AIEventIndicator = ({ channelID }: Props) => {
    const [aiEvent, setAIEvent] = useState("")
    const [showAIEvent, setShowAIEvent] = useState(false)

    useFrappeEventListener("ai_event", (data) => {
        if (data.channel_id === channelID) {
            setAIEvent(data.text)
            setShowAIEvent(true)
        }
    })

    useFrappeEventListener("ai_event_clear", (data) => {
        if (data.channel_id === channelID) {
            setAIEvent("")
        }
    })

    useEffect(() => {
        if (!aiEvent) {
            setTimeout(() => {
                setShowAIEvent(false)
            }, 300)
        }
    }, [aiEvent])

    if (!showAIEvent) return null

    return (
        <Animated.View
            className='flex flex-row gap-2 px-4 pt-1 items-center bg-background'
            entering={FadeInDown}
            exiting={FadeOutDown}>
            <SpinningLoader size={20} />
            <Text className='text-base text-muted-foreground'>{aiEvent}</Text>
        </Animated.View>
    )
}

export default AIEventIndicator