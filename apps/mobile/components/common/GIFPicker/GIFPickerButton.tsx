import { Button, ButtonProps } from "@components/nativewindui/Button"
import GIFIcon from "@assets/icons/GIFIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import { Text } from '@components/nativewindui/Text'
import { TextProps } from "react-native"
import { Sheet, useSheetRef } from "@components/nativewindui/Sheet"
import { BottomSheetView } from "@gorhom/bottom-sheet"
import GIFPicker from "./GIFPicker"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface GIFPickerButtonProps {
    buttonProps?: ButtonProps
    icon?: React.ReactNode
    iconProps?: SvgProps
    label?: string
    labelProps?: TextProps
    onSelect: (gif: any) => void
}

const GIFPickerButton = ({ buttonProps, iconProps, icon, label, labelProps, onSelect }: GIFPickerButtonProps) => {
    const { colors } = useColorScheme()
    const bottomSheetRef = useSheetRef()
    const { top } = useSafeAreaInsets()


    return (
        <>
            <Button variant="plain" size={label ? "none" : "icon"} onPress={() => bottomSheetRef.current?.present()} {...buttonProps} >
                {icon ?? <GIFIcon height={20} width={20} color={colors.icon} {...iconProps} />}
                {label && <Text className=" text-sm text-foreground" {...labelProps}>{label}</Text>}
            </Button>
            <Sheet ref={bottomSheetRef} topInset={top}>
                <BottomSheetView className='pb-16'>
                    <GIFPicker onSelect={onSelect} />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default GIFPickerButton