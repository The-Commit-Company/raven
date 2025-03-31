import { Message } from "@raven/types/common/Message"
import { useColorScheme } from "@hooks/useColorScheme"
import { useTogglePinMessage } from "@hooks/useTogglePinMessage"
import PinOutlineIcon from "@assets/icons/PinOutlineIcon.svg"
import UnpinOutlineIcon from "@assets/icons/UnpinOutlineIcon.svg"
import ActionButton from "@components/common/Buttons/ActionButton"

interface PinMessageProps {
    message: Message
    onClose: () => void
}

const PinMessage = ({ message, onClose }: PinMessageProps) => {

    const { colors } = useColorScheme()
    const { TogglePin } = useTogglePinMessage(message)

    const handlePin = () => {
        TogglePin()
        onClose()
    }

    return (
        <ActionButton
            onPress={handlePin}
            icon={message.is_pinned === 1 ? <UnpinOutlineIcon height={18} width={18} stroke={colors.icon} /> : <PinOutlineIcon height={18} width={18} stroke={colors.icon} />}
            text={message.is_pinned === 1 ? 'Unpin' : 'Pin'}
        />
    )
}

export default PinMessage