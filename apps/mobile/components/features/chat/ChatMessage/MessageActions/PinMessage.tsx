import { Pressable, View } from "react-native"
import { Message } from "@raven/types/common/Message"
import { useColorScheme } from "@hooks/useColorScheme"
import PinIcon from "@assets/icons/PinIcon.svg"
import { Text } from "@components/nativewindui/Text"
import { useTogglePinMessage } from "@hooks/useTogglePinMessage"

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
            <PinIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Pin</Text>
        </Pressable>
    )
}

export default PinMessage