import { Text } from '@components/nativewindui/Text'
import { TouchableOpacity, View } from 'react-native'
import InfoIcon from '@assets/icons/InfoIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { useCallback } from 'react'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Button } from '@components/nativewindui/Button'

const HowToSetupMobile = () => {

    const { colors } = useColorScheme()

    const infoSheetRef = useSheetRef()

    const onPress = useCallback(() => {
        infoSheetRef.current?.present()
    }, [])

    const onDismiss = useCallback(() => {
        infoSheetRef.current?.dismiss()
    }, [])

    return (
        <View>
            <TouchableOpacity className='flex-row items-center gap-1' onPress={onPress}>
                <InfoIcon height={16} width={16} fill={colors.icon} />
                <Text className='text-sm text-muted-foreground'>How do I setup my site for Raven mobile?</Text>
            </TouchableOpacity>

            <Sheet enableDynamicSizing ref={infoSheetRef}>
                <BottomSheetView className='pb-8'>
                    <HowToSetupMobileContent onDismiss={onDismiss} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

const HowToSetupMobileContent = ({ onDismiss }: { onDismiss: () => void }) => {

    const BoldText = ({ children }: { children: React.ReactNode }) => {
        return <Text className='text-base text-foreground font-medium'>{children}</Text>
    }

    const StepNumber = ({ number }: { number: number }) => {
        return <Text className='text-base text-foreground font-normal' style={{
            fontVariant: ['tabular-nums']
        }}>{number}.</Text>
    }

    return <View className='p-4 flex gap-4'>
        <Text className='text-lg text-foreground font-semibold'>Set up Raven mobile on your site</Text>
        <View className='flex gap-2'>
            <Text className='text-base text-foreground'>
                <StepNumber number={1} /> Open Raven on your desktop browser
            </Text>
            <Text className='text-base text-foreground'>
                <StepNumber number={2} /> Go to <BoldText>Settings {">"} Mobile App</BoldText>
            </Text>
            <Text className='text-base text-foreground'>
                <StepNumber number={3} /> Click on <BoldText>Configure OAuth Client</BoldText>
            </Text>
        </View>

        <View className='flex gap-2'>
            <Text className='text-base text-foreground'>
                This will create an OAuth client that users can use to authenticate securely on the mobile app.
            </Text>

            <Text className='text-base text-muted-foreground'>
                PS: Only System Administrators can do this.
            </Text>
        </View>

        <Button onPress={onDismiss}>
            <Text>Close</Text>
        </Button>
    </View>

}

export default HowToSetupMobile