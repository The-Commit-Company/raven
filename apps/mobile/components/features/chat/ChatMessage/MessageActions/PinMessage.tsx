import { Pressable } from "react-native"
import { Message } from "@raven/types/common/Message"
import { useColorScheme } from "@hooks/useColorScheme"
import { Text } from "@components/nativewindui/Text"
import { useTogglePinMessage } from "@hooks/useTogglePinMessage"
import PinOutlineIcon from "@assets/icons/PinOutlineIcon.svg"
import UnpinOutlineIcon from "@assets/icons/UnpinOutlineIcon.svg"

interface PinMessageProps {
    message: Message
    onClose: () => void
}

const PinMessage = ({ message, onClose }: PinMessageProps) => {

    const { colors } = useColorScheme()
    const { TogglePin, error } = useTogglePinMessage(message)

    const handlePin = () => {
        TogglePin()
        onClose()
    }

    return (
        <Pressable
            onPress={handlePin}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            {message.is_pinned === 1 ?
                <>
                    <UnpinOutlineIcon height={18} width={18} stroke={colors.icon} />
                    <Text className='text-base text-foreground'>Unpin</Text>
                </>
                :
                <>
                    <PinOutlineIcon height={18} width={18} stroke={colors.icon} />
                    <Text className='text-base text-foreground'>Pin</Text>
                </>
            }
        </Pressable>
    )
}

export default PinMessage