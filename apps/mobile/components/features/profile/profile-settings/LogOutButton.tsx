import { Pressable } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import LogOutIcon from '@assets/icons/LogOutIcon.svg';
import { useLogout } from '@hooks/useLogout';

const LogOutButton = () => {

    const { colors } = useColorScheme()

    const onLogout = useLogout()

    return (
        <Pressable onPress={onLogout}
            className="flex flex-row items-center py-3 px-4 rounded-xl justify-between bg-background dark:bg-card ios:active:bg-red-50 dark:ios:active:bg-red-100/10">
            <Text className="font-medium text-destructive">Log Out</Text>
            <LogOutIcon height={16} width={16} color={colors.grey} />
        </Pressable>
    )

}

export default LogOutButton