import { Text } from '@components/nativewindui/Text'
import { TouchableOpacity, View } from 'react-native'
import InfoIcon from '@assets/icons/InfoIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { useCallback } from 'react'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Button } from '@components/nativewindui/Button'
import { useTranslation } from 'react-i18next'

const HowToSetupMobile = () => {

    const { t } = useTranslation()
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
                <Text className='text-sm text-muted-foreground'>{t('setup.howToSetupMobile')}</Text>
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

    const { t } = useTranslation()

    const BoldText = ({ children }: { children: React.ReactNode }) => {
        return <Text className='text-base text-foreground font-medium'>{children}</Text>
    }

    const StepNumber = ({ number }: { number: number }) => {
        return <Text className='text-base text-foreground font-normal' style={{
            fontVariant: ['tabular-nums']
        }}>{number}.</Text>
    }

    return <View className='p-4 flex gap-4'>
        <Text className='text-lg text-foreground font-semibold'>{t('setup.title')}</Text>
        <View className='flex gap-2'>
            <Text className='text-base text-foreground'>
                <StepNumber number={1} /> {t('setup.step1')}
            </Text>
            <Text className='text-base text-foreground'>
                <StepNumber number={2} /> {t('setup.step2')}
            </Text>
            <Text className='text-base text-foreground'>
                <StepNumber number={3} /> {t('setup.step3')}
            </Text>
        </View>

        <View className='flex gap-2'>
            <Text className='text-base text-foreground'>
                {t('setup.oauthDescription')}
            </Text>

            <Text className='text-base text-muted-foreground'>
                {t('setup.adminNote')}
            </Text>
        </View>

        <Button onPress={onDismiss}>
            <Text>{t('common.close')}</Text>
        </Button>
    </View>

}

export default HowToSetupMobile