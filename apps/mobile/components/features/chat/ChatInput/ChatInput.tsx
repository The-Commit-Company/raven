import { TextInput, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"

const ChatInput = () => {

    return (
        <View className="flex-col gap-2 w-full">
            <TextInput
                placeholder='Type a message...'
                className="color-foreground w-full"
            />
            <InputBottomBar />
        </View>
    )
}

const InputBottomBar = () => {

    const { colors } = useColorScheme()

    return (
        <View className="flex-row gap-4 justify-start items-start">
            <AdditionalInputs />
            <Button size='icon' variant="plain" className="absolute right-0">
                <SendIcon fill={colors.primary} />
            </Button>
        </View>
    )
}

export default ChatInput