import { Loader } from '@/components/common/Loader'
import { Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'

type Props = {
    channelID: string
    onMessageSent?: () => void
}

const AIEvent = ({ channelID }: Props) => {
    // Initialize state by checking if this is a new AI thread
    const initializeState = () => {
        const aiThreadInfo = sessionStorage.getItem('ai_thread_thinking');
        if (aiThreadInfo) {
            const info = JSON.parse(aiThreadInfo);
            if (info.threadID === channelID && (Date.now() - info.timestamp) < 5000) {
                sessionStorage.removeItem('ai_thread_thinking');
                return {
                    aiEvent: "Raven is thinking...",
                    showAIEvent: true,
                    isNewThread: true,
                    thinkingStartTime: Date.now()
                };
            }
        }
        return {
            aiEvent: "",
            showAIEvent: false,
            isNewThread: false,
            thinkingStartTime: 0
        };
    };

    const initialState = initializeState();
    const [aiEvent, setAIEvent] = useState(initialState.aiEvent)
    const [showAIEvent, setShowAIEvent] = useState(initialState.showAIEvent)
    const [isNewThread, setIsNewThread] = useState(initialState.isNewThread)
    const [thinkingStartTime, setThinkingStartTime] = useState(initialState.thinkingStartTime)


    useFrappeEventListener("ai_event", (data) => {
        if (data.channel_id === channelID) {
            setAIEvent(data.text)
            setShowAIEvent(true)
            setIsNewThread(false) // Reset flag when we get a real event
            setThinkingStartTime(Date.now()) // Reset timer for new thinking messages
        }
    })

    useFrappeEventListener("ai_event_clear", (data) => {
        if (data.channel_id === channelID) {
            const timeSinceThinking = thinkingStartTime ? Date.now() - thinkingStartTime : 0;
            const MIN_DISPLAY_TIME = 2000; // Minimum 2 seconds display time
            
            // For all messages (including new threads), ensure minimum display time of 2 seconds
            if (thinkingStartTime && timeSinceThinking < MIN_DISPLAY_TIME) {
                // Schedule the clear for later to meet minimum display time
                const remainingTime = MIN_DISPLAY_TIME - timeSinceThinking;
                setTimeout(() => {
                    setAIEvent("")
                    setIsNewThread(false)
                }, remainingTime);
                return;
            }
            
            // If enough time has passed, clear immediately
            setAIEvent("")
            setIsNewThread(false)
        }
    })


    useEffect(() => {
        if (!aiEvent && showAIEvent) {
            setTimeout(() => {
                setShowAIEvent(false)
            }, 300)
        }
    }, [aiEvent])

    return (
        <div className={clsx(
            'w-full transition-all duration-300 ease-ease-out-quart',
            showAIEvent ? 'translate-y-0 opacity-100 z-50 sm:pb-0 pb-16' : 'translate-y-full opacity-0 h-0'
        )}>
            <div className="flex items-center gap-2 py-2 px-2 bg-white dark:bg-gray-2">
                <Loader />
                <Text size='2'>{aiEvent}</Text>
            </div>
        </div>
    )
}

export default AIEvent