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

    useFrappeEventListener("ai_event", (data) => {
        if (data.channel_id === channelID) {
            setAIEvent(data.text)
        }
    })

    useFrappeEventListener("ai_event_clear", (data) => {
        if (data.channel_id === channelID) {
            setAIEvent("")
        }
    })

    useEffect(() => {
        if (aiEvent) {
            setTimeout(() => {
                setAIEvent("")
            }, 5000)
        }
    }, [aiEvent])

    return (
        <div className={clsx('flex items-center gap-2 py-2 px-1 animate-fade-in transition-all duration-300 ease-ease-out-circ', aiEvent ? 'opacity-100' : 'opacity-0 p-0')}>
            <Loader />
            <Text size='2'>{aiEvent}</Text>
        </div>
    )
}

export default AIEvent