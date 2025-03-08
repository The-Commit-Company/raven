import { Loader } from '@/components/common/Loader'
import { Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'

type Props = {
    channelID: string
}

const AIEvent = ({ channelID }: Props) => {
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