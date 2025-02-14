import { Platform, Pressable, SafeAreaView, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useFrappeUpdateDoc } from 'frappe-react-sdk';
import { Text } from '@components/nativewindui/Text';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import SolidCircle from "@assets/icons/SolidCIrcleIcon.svg"
import PowerResetIcon from "@assets/icons/PowerResetIcon.svg"
import CircleMinusIcon from "@assets/icons/CIrcleMinusIcon.svg"
import CircleDotIcon from "@assets/icons/CircleDotIcon.svg"
import { Divider } from '@components/layout/Divider';
import { toast } from 'sonner-native';

export type AvailabilityStatus = 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | ''

export default function AvailabilityStatusScreen() {

    const { myProfile, mutate } = useCurrentRavenUser()

    const { updateDoc } = useFrappeUpdateDoc()

    const save = async (availability_status: AvailabilityStatus) => {
        return updateDoc("Raven User", myProfile?.name ?? null, {
            availability_status
        }).then(() => {
            toast.success("Availability status updated")
            mutate()
            router.back();
        }).catch(() => {
            toast.error("Availability status update failed")
        })
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Availability Status',
                    headerTransparent: Platform.OS === 'ios',
                    headerBlurEffect: 'systemMaterial',
                }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View className='m-3 rounded-lg border border-gray-300'>
                    {["Available", "Away", "Do not disturb", "Invisible"].map((status: AvailabilityStatus | string) => {
                        return (
                            <View key={status}>
                                <Pressable className='flex-row items-center gap-3 p-3 ios:active:bg-linkColor'
                                    android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }} onPress={() => save(status as AvailabilityStatus)}
                                >
                                    <Text>{getStatusText(status as AvailabilityStatus)}</Text>
                                </Pressable>
                                <Divider />
                            </View>
                        )
                    })}
                    <Pressable className='flex-row items-center gap-3 p-3 ios:active:bg-linkColor'
                        // Add a subtle ripple effect on Android
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }} onPress={() => save("")}
                    >
                        <View className="flex flex-row items-center">
                            <Text>
                                <PowerResetIcon width={18} height={16} />
                            </Text>
                            <Text className="ml-2.5 text-sm">Reset</Text>
                        </View>
                    </Pressable>
                </View>
            </SafeAreaView>
        </>
    );
}

const getStatusText = (status: AvailabilityStatus, size: number = 16) => {
    switch (status) {
        case 'Available':
            return (
                <View className="flex flex-row items-center">
                    <SolidCircle width={size} height={size} fill="green" />
                    <Text className="ml-2.5 text-sm">{"Available"}</Text>
                </View>
            );
        case 'Away':
            return (
                <View className="flex flex-row items-center">
                    <SolidCircle width={size} height={size} fill="#FFAA33" />
                    <Text className="ml-2.5 text-sm">{"Away"}</Text>
                </View>
            );
        case 'Do not disturb':
            return (
                <View className="flex flex-row items-center">
                    <CircleMinusIcon width={size} height={size} fill="#D22B2B" />
                    <Text className="ml-2.5 text-sm">{"Do not disturb"}</Text>
                </View>
            );
        case 'Invisible':
            return (
                <View className="flex flex-row items-center">
                    <CircleDotIcon width={size} height={size} fill="#9CA3AF" />
                    <Text className="ml-2.5 text-sm">{"Invisible"}</Text>
                </View>
            );
        default:
            return (
                <View className="flex flex-row items-center">
                    <SolidCircle width={size} height={size} fill="green" />
                    <Text className="ml-2.5 text-sm">{"Available"}</Text>
                </View>
            );
    }
};