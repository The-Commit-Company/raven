import { View } from 'react-native'
import BellOutlineIcon from '@assets/icons/BellOutlineIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import { Toggle } from '@components/nativewindui/Toggle'
import { useCallback, useEffect, useState } from 'react'
import messaging, { getMessaging } from '@react-native-firebase/messaging';

const NotificationSetting = () => {

    const { colors } = useColorScheme()
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        messaging().hasPermission().then((hasPermission) => {
            setEnabled(hasPermission === messaging.AuthorizationStatus.AUTHORIZED)
        })
    }, [])

    const onToggle = useCallback(() => {
        getMessaging().requestPermission().then((authorizationStatus: -1 | 0 | 1) => {
            console.log('authorizationStatus', authorizationStatus)
        }).then(() => {
            messaging().getToken().then((token) => {
                console.log('token', token)
            })
        })
    }, [])

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2'>
                    <BellOutlineIcon height={18} width={18} fill={colors.icon} />
                    <Text className='text-base'>Push Notifications</Text>
                </View>
                <Toggle value={enabled} onValueChange={onToggle} />
            </View>
        </View>
    )
}

export default NotificationSetting