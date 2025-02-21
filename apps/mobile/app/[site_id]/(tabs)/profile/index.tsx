import { router, Stack } from 'expo-router';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@components/nativewindui/Avatar';
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
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import useFileURL from '@hooks/useFileURL';
import DeleteButton from '@components/features/profile/upload-profile/DeleteButton';
import CameraButton from '@components/features/profile/upload-profile/CameraButton';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import ViewProfileButton from '@components/features/profile/upload-profile/ViewProfileButton';
import { Divider } from '@components/layout/Divider';
import LogOutButton from '@components/features/profile/profile-settings/LogOutButton';
import NotificationSetting from '@components/features/profile/profile-settings/NotificationSetting';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppearanceSetting from '@components/features/profile/profile-settings/AppearanceSetting';


const SCREEN_OPTIONS = {
    title: 'Profile',
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: 'systemMaterial',
} as const;

const ESTIMATED_ITEM_SIZE =
    ESTIMATED_ITEM_HEIGHT[Platform.OS === 'ios' ? 'titleOnly' : 'withSubTitle'];

export default function Profile() {

    const { myProfile } = useCurrentRavenUser()
    const insets = useSafeAreaInsets()

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <View className='flex-1 px-3'>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom }}>
                    <View className='flex flex-col gap-6'>
                        <List
                            variant="insets"
                            data={DATA({ full_name: myProfile?.full_name, custom_status: myProfile?.custom_status })}
                            sectionHeaderAsGap={Platform.OS === 'ios'}
                            estimatedItemSize={ESTIMATED_ITEM_SIZE}
                            renderItem={renderItem}
                            ListHeaderComponent={<ListHeaderComponent />}
                        />
                        <View className='flex flex-col gap-0.5'>
                            <NotificationSetting />
                            <AppearanceSetting />
                        </View>
                        <LogOutButton />
                        <View className='flex flex-col justify-center items-center pt-6 pb-3 gap-1.5'>
                            <Text className='text-base text-muted-foreground/90 font-cal-sans'>raven</Text>
                            <View className='flex flex-col items-center justify-center'>
                                <Text className='text-xs text-muted-foreground/80'>by The Commit Company</Text>
                                <Text className='text-xs text-muted-foreground/80'>Version 1.7.1 (1)</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
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

    const { myProfile, mutate } = useCurrentRavenUser()

    const source = useFileURL(myProfile?.user_image ?? "")

    const bottomSheetRef = useSheetRef()

    const onSheetClose = (isMutate: boolean = true) => {
        bottomSheetRef.current?.close()

        if (isMutate) {
            mutate()
        }
    }

    return (
        <View className="ios:pb-8 items-center pb-4 pt-8">
            <TouchableOpacity activeOpacity={0.8} onPress={() => bottomSheetRef.current?.present()} className='relative'>
                <Avatar alt={`${myProfile?.full_name}'s Profile`} className="h-36 w-36">
                    <AvatarImage source={source} />
                    <AvatarFallback>
                        <Text
                            variant="largeTitle"
                            className={cn(
                                'dark:text-background font-medium text-white',
                                Platform.OS === 'ios' && 'dark:text-foreground'
                            )}>
                            {myProfile?.full_name?.charAt(0)}{myProfile?.full_name?.charAt(1)}
                        </Text>
                    </AvatarFallback>
                </Avatar>
            </TouchableOpacity>

            <Sheet ref={bottomSheetRef}>
                <BottomSheetView className='flex flex-colum gap-1 pb-10'>
                    <Text className='px-4 text-lg font-semibold'>Upload Photo</Text>
                    <View className='p-4 flex-col justify-start items-stretch w-full gap-1'>
                        <CameraButton onSheetClose={onSheetClose} />
                        {myProfile?.user_image ? (
                            <>
                                <ViewProfileButton uri={source?.uri ?? ""} onSheetClose={onSheetClose} />
                                <Divider className='mx-0 my-0.5' prominent />
                                <DeleteButton onSheetClose={onSheetClose} />
                            </>
                        ) : null}
                    </View>
                </BottomSheetView>
            </Sheet>
            <View className="p-2" />
            <Text variant="title1" className='font-medium'>{myProfile?.full_name}</Text>
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
    ];

}