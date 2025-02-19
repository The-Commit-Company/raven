import { router } from "expo-router"
import { SvgProps } from "react-native-svg"
import { Button, ButtonProps } from "@components/nativewindui/Button"
import { useColorScheme } from "@hooks/useColorScheme"
import { Text } from '@components/nativewindui/Text'
import BarChartIcon from "@assets/icons/OutlineBarChartIcon.svg"

interface CreatePollButtonProps {
    buttonProps?: ButtonProps
    iconProps?: SvgProps
    icon?: React.ReactNode
    label?: string
    onSheetClose: () => void
}

const CreatePollButton = ({ icon, label, buttonProps, iconProps, onSheetClose }: CreatePollButtonProps) => {
    const { colors } = useColorScheme()

    const navigateToCreatePoll = () => {
        router.push("./create-poll", { relativeToDirectory: true })
        onSheetClose()
    }

    return (
        <Button variant="plain" size={label ? "none" : "icon"} onPress={navigateToCreatePoll} {...buttonProps} >
            {icon ?? <BarChartIcon height={20} width={20} color={colors.icon} {...iconProps} />}
            {label && <Text className=" text-sm text-foreground">{label}</Text>}
        </Button>
    )
}

export default CreatePollButton