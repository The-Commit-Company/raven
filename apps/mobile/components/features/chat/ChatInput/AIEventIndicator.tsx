import SpinningLoader from '@components/layout/SpinningLoader'
import { Text } from '@components/nativewindui/Text'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
import { TouchableOpacity, View, Alert } from 'react-native'
import Animated, {
    FadeOutDown,
    FadeInDown
} from 'react-native-reanimated'
import { BiStopCircle } from 'react-icons/bi'

type Props = {
    channelID: string
}

const AIEventIndicator = ({ channelID }: Props) => {
    const [aiEvent, setAIEvent] = useState("")
    const [showAIEvent, setShowAIEvent] = useState(false)
    const [stopping, setStopping] = useState(false)

    const { call: stopAIRequest, loading: stoppingRequest } = useFrappePostCall<any>('raven.api.ai.stop_ai_request')

    useFrappeEventListener("ai_event", (data) => {
        try {
            if (data.channel_id === channelID) {
                const eventText = typeof data.text === 'string' ? data.text : String(data.text || '')
                setAIEvent(eventText)
                setShowAIEvent(true)
                setStopping(false) // Reset stopping state when new AI event starts
            }
        } catch (error) {
            console.error('Error in ai_event listener:', error)
        }
    })

    useFrappeEventListener("ai_event_clear", (data) => {
        try {
            if (data.channel_id === channelID) {
                setAIEvent("")
                setStopping(false)
            }
        } catch (error) {
            console.error('Error in ai_event_clear listener:', error)
        }
    })

    useFrappeEventListener("ai_request_stopped", (data) => {
        try {
            if (data.channel_id === channelID) {
                const message = typeof data.message === 'string' ? data.message : "AI request stopped successfully"
                Alert.alert("Success", message)
                setStopping(false)
            }
        } catch (error) {
            console.error('Error in ai_request_stopped listener:', error)
        }
    })

    useEffect(() => {
        try {
            if (!aiEvent) {
                setTimeout(() => {
                    setShowAIEvent(false)
                }, 300)
            }
        } catch (error) {
            console.error('Error in useEffect:', error)
        }
    }, [aiEvent])

    const handleStopRequest = async () => {
        try {
            setStopping(true)
            
            const result = await stopAIRequest({
                channel_id: channelID
            })
            
            const apiResponse = result.message
            
            if (apiResponse?.success) {
                // Only set state, don't show Alert, let backend handle success message
                setAIEvent("Stopping AI request...")
            } else {
                // Show error message only when really failed
                const errorMessage = apiResponse?.message || "Failed to stop AI request"
                Alert.alert("Error", errorMessage)
                setStopping(false)
            }
        } catch (error) {
            console.error('Error stopping AI request:', error)
            Alert.alert("Error", "An error occurred while stopping the request")
            setStopping(false)
        }
    }

    if (!showAIEvent) return null

    return (
        <Animated.View
            className='flex flex-row justify-between items-center gap-2 px-4 pt-1 bg-background border-b border-gray-200 dark:border-gray-700'
            entering={FadeInDown}
            exiting={FadeOutDown}>
            <View className="flex flex-row gap-2 items-center flex-1">
                <SpinningLoader size={20} />
                <Text className='text-base text-muted-foreground'>
                    {stopping || stoppingRequest ? "Stopping AI request..." : (aiEvent || "")}
                </Text>
            </View>
            
            {!stopping && !stoppingRequest && aiEvent && (
                <TouchableOpacity
                    onPress={handleStopRequest}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 active:bg-red-100 dark:active:bg-red-900/20"
                    accessibilityLabel="Stop AI request"
                >
                    <BiStopCircle size={18} color="#6b7280" />
                </TouchableOpacity>
            )}
        </Animated.View>
    )
}

export default AIEventIndicator