import { router, Stack } from 'expo-router';
import { Linking, Platform, View } from 'react-native';
import { Avatar, AvatarFallback } from '@components/nativewindui/Avatar';
import { Button } from '@components/nativewindui/Button';
import {
    ESTIMATED_ITEM_HEIGHT,
    List,
    ListItem,
    ListRenderItemInfo,
    ListSectionHeader,
} from '@components/nativewindui/List';
import { Text } from '@components/nativewindui/Text';
import { cn } from '@lib/cn';
import { useColorScheme } from '@lib/useColorScheme';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useFrappeGetCall } from 'frappe-react-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_OPTIONS = {
    title: 'Profile',
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: 'systemMaterial',
} as const;

const ESTIMATED_ITEM_SIZE =
    ESTIMATED_ITEM_HEIGHT[Platform.OS === 'ios' ? 'titleOnly' : 'withSubTitle'];

export default function Profile() {
    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <List
                variant="insets"
                data={DATA}
                sectionHeaderAsGap={Platform.OS === 'ios'}
                estimatedItemSize={ESTIMATED_ITEM_SIZE}
                renderItem={renderItem}
                ListHeaderComponent={<ListHeaderComponent />}
                ListFooterComponent={<ListFooterComponent />}
            />
        </>
    );
}

function renderItem(info: ListRenderItemInfo<DataItem>) {
    return <Item info={info} />;
}

function Item({ info }: { info: ListRenderItemInfo<DataItem> }) {
    const { colors, isDarkColorScheme } = useColorScheme()

    if (typeof info.item === 'string') {
        return <ListSectionHeader {...info} />;
    }
    return (
        <ListItem
            titleClassName="text-lg"
            rightView={
                <View className="flex-1 flex-row items-center gap-0.5 px-2">
                    {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
                    <ChevronRightIcon fill={colors.icon} />
                </View>
            }
            onPress={info.item.onPress}
            {...info}
        />
    );
}

function ListHeaderComponent() {

    const { data, mutate } = useFrappeGetCall('raven.api.raven_users.get_current_raven_user',
        undefined,
        'my_profile',
        {
            // revalidateIfStale: false,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateOnReconnect: true
        }
    )
    return (
        <View className="ios:pb-8 items-center pb-4  pt-8">
            <Avatar alt={`${data?.message?.full_name}'s Profile`} className="h-36 w-36">
                <AvatarFallback>
                    <Text
                        variant="largeTitle"
                        className={cn(
                            'dark:text-background font-medium text-white',
                            Platform.OS === 'ios' && 'dark:text-foreground'
                        )}>
                        {data?.message?.full_name?.charAt(0) + data?.message?.full_name?.charAt(1)}
                    </Text>
                </AvatarFallback>
            </Avatar>
            <View className="p-2" />
            <Text variant="title1" className='font-medium'>{data?.message?.full_name}</Text>
        </View>
    );
}

function ListFooterComponent() {

    const onLogout = () => {
        // TODO: Remove the current site from AsyncStorage
        // Revoke the token
        // Redirect to the landing page

        AsyncStorage.removeItem('default-site')
        router.replace('/landing')
    }
    return (
        <View className="ios:px-0 px-4 pt-8">
            <Button
                size="lg"
                onPress={onLogout}
                variant={Platform.select({ ios: 'primary', default: 'secondary' })}
                className="border-border bg-card">
                <Text className="text-destructive">Log Out</Text>
            </Button>
        </View>
    );
}

type DataItem =
    | string
    | {
        id: string;
        title: string;
        value?: string;
        subTitle?: string;
        onPress: () => void;
    };

const DATA: DataItem[] = [
    ...(Platform.OS !== 'ios' ? ['Basic info'] : []),
    {
        id: 'name',
        title: 'Name',
        ...(Platform.OS === 'ios' ? { value: 'Janhvi Patil' } : { subTitle: 'Janhvi Patil' }),
        onPress: () => router.push('./name', {
            relativeToDirectory: true
        }),
    },
    {
        id: 'username',
        title: 'Username',
        ...(Platform.OS === 'ios' ? { value: '@janhvipatil' } : { subTitle: '@janhvipatil' }),
        onPress: () => router.push('./username', {
            relativeToDirectory: true
        }),
    },
    ...(Platform.OS !== 'ios' ? ['Stay up to date'] : ['']),
    {
        id: '4',
        title: 'Notifications',
        ...(Platform.OS === 'ios' ? { value: 'Push' } : { subTitle: 'Push' }),
        onPress: () => router.push('./notification', {
            relativeToDirectory: true
        }),
    },
    {
        id: '7',
        title: 'About',
        ...(Platform.OS === 'ios' ? { value: 'Raven 1.7.1' } : { subTitle: 'Raven 1.7.1' }),
        onPress: () => Linking.openURL('https://www.ravenchat.ai/'),
    },
];
