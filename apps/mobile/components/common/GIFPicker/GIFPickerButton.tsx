import GIFIcon from "@assets/icons/GIFIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { Text } from '@components/nativewindui/Text'
import { Pressable } from "react-native"
import { Sheet, useSheetRef } from "@components/nativewindui/Sheet"
import { BottomSheetView } from "@gorhom/bottom-sheet"
import GIFPicker from "./GIFPicker"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface GIFPickerButtonProps {
    onSelect: (gif: any) => void
}

const GIFPickerButton = ({ onSelect }: GIFPickerButtonProps) => {

    const { colors } = useColorScheme()
    const gifSheetRef = useSheetRef()
    const { top } = useSafeAreaInsets()

    const openGIFPicker = () => {
        gifSheetRef.current?.present()
    }

    return (
        <>
            <Pressable
                onPress={openGIFPicker}
                className='flex flex-row w-full items-center gap-2 p-2 rounded-lg ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <GIFIcon height={20} width={20} fill={colors.icon} />
                <Text className='text-base text-foreground'>Send GIF</Text>
            </Pressable>
            <Sheet ref={gifSheetRef} topInset={top}>
                <BottomSheetView className='pb-16'>
                    <GIFPicker onSelect={onSelect} />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default GIFPickerButton