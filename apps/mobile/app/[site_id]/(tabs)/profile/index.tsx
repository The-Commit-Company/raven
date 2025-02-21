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
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { FrappeConfig, FrappeContext, useFrappeGetCall } from 'frappe-react-sdk';
import { revokeAsync } from 'expo-auth-session';
import { useContext } from 'react';
import { SiteContext } from '../../_layout';
import { clearDefaultSite, deleteAccessToken, getRevocationEndpoint } from '@lib/auth';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

const SCREEN_OPTIONS = {
    title: 'Profile',
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: 'systemMaterial',
} as const;

const ESTIMATED_ITEM_SIZE =
    ESTIMATED_ITEM_HEIGHT[Platform.OS === 'ios' ? 'titleOnly' : 'withSubTitle'];

export default function Profile() {

    const { myProfile } = useCurrentRavenUser()

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <List
                variant="insets"
                data={DATA({ full_name: myProfile?.full_name, custom_status: myProfile?.custom_status })}
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
    const { colors } = useColorScheme()

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
        <View className="ios:pb-8 items-center pb-4 pt-8">
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

    const siteInformation = useContext(SiteContext)
    const { tokenParams } = useContext(FrappeContext) as FrappeConfig

    const onLogout = () => {
        // Remove the current site from AsyncStorage
        // Revoke the token
        // Redirect to the landing page

        revokeAsync({
            clientId: siteInformation?.client_id || '',
            token: tokenParams?.token?.() || ''
        }, {
            revocationEndpoint: getRevocationEndpoint(siteInformation?.url || '')
        }).then(result => {
            return deleteAccessToken(siteInformation?.sitename || '')
        }).then((result) => {
            return clearDefaultSite()
        }).then(() => {
            router.replace('/landing')
        }).catch((error) => {
            console.log(error)
        })
    }
    return (
        <View className="ios:px-0 px-4 pt-8">
            <Button
                size="lg"
                onPress={onLogout}
                variant={Platform.select({ ios: 'primary', default: 'secondary' })}
                className="border-border bg-background dark:bg-card">
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

const DATA = (userData: { full_name: string | undefined, custom_status: string | undefined }): DataItem[] => {
    return [
        ...(Platform.OS !== 'ios' ? ['Basic info'] : []),
        {
            id: 'fullname',
            title: 'Full Name',
            ...(Platform.OS === 'ios' ? { value: userData?.full_name } : { subTitle: userData?.full_name }),
            onPress: () => router.push('./fullname', {
                relativeToDirectory: true
            }),
        },
        {
            id: 'custom_status',
            title: 'Custom Status',
            ...(Platform.OS === 'ios' ? { value: userData?.custom_status || "-" } : { subTitle: userData?.custom_status || "-" }),
            onPress: () => router.push('./custom_status', {
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

}