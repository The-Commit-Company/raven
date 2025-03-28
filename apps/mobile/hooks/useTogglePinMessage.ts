import { Message } from "@raven/types/common/Message"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { toast } from "sonner-native"

export const useTogglePinMessage = (message: Message) => {
    const isPinned = message.is_pinned
    const { call } = useContext(FrappeContext) as FrappeConfig
    const [error, setError] = useState<string | null>(null)
    const TogglePin = () => {
        call.post('raven.api.raven_channel.toggle_pin_message', {
            channel_id: message.channel_id,
            message_id: message.name,
        }).then(() => {
            toast.success(`Message ${isPinned ? 'unpinned' : 'pinned'}`)
        }).catch((e) => {
            console.error(e)
            setError(e)
        })
    }

    return { TogglePin, error }
}
