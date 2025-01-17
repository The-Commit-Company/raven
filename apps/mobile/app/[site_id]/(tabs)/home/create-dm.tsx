import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { View } from 'react-native';
import { SearchInput } from '@components/nativewindui/SearchInput';

export default function CreateDM() {

    const { colors } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Create direct message',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex-1">
            <View className="p-3">
                <SearchInput style={{ backgroundColor: colors.grey5 }}
                    placeholder="Search"
                    iconColor={colors.destructive}
                    placeholderTextColor={colors.grey} />
            </View>
        </View>
    </>
}