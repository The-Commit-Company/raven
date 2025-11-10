import { Loader } from '@/components/common/Loader'
import { IconButton, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
import { BiStopCircle } from 'react-icons/bi'
import { toast } from 'sonner'

type Props = {
    channelID: string
}

const AIEvent = ({ channelID }: Props) => {
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
                toast.success("AI request stopped", {
                    description: message
                })
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

    const handleStopRequest = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent page jump
        e.stopPropagation() // Prevent event bubbling
        
        setStopping(true)
        try {
            const result = await stopAIRequest({
                channel_id: channelID
            })
            
            const apiResponse = result.message
            
            if (apiResponse?.success) {
                // Only set state, don't show toast, let backend handle success message
                setAIEvent("Stopping AI request...")
            } else {
                // Show error message only when really failed
                const errorMessage = apiResponse?.message || "Unknown error occurred"
                toast.error("Failed to stop AI request", {
                    description: errorMessage
                })
                setStopping(false)
            }
        } catch (error) {
            console.error('Error stopping AI request:', error)
            toast.error("Failed to stop AI request", {
                description: "An error occurred while stopping the request"
            })
            setStopping(false)
        }
    }

    return (
        <div className={clsx(
            'w-full transition-all duration-300 ease-ease-out-quart',
            showAIEvent ? 'translate-y-0 opacity-100 z-50 sm:pb-0 pb-16' : 'translate-y-full opacity-0 h-0'
        )}>
            <div className="flex items-center justify-between gap-2 py-2 px-2 bg-white dark:bg-gray-2 border-b border-gray-3">
                <div className="flex items-center gap-2">
                    <Loader />
                    <Text size='2'>
                        {stopping || stoppingRequest ? "Stopping AI request..." : (aiEvent || "")}
                    </Text>
                </div>
                
                {!stopping && !stoppingRequest && aiEvent && (
                    <IconButton
                        type="button"
                        variant="soft"
                        size="1"
                        color="gray"
                        onClick={handleStopRequest}
                        title="Stop AI request"
                        className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                        <BiStopCircle size="14" />
                    </IconButton>
                )}
            </div>
        </div>
    )
}

export default AIEvent