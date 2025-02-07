import { router, Stack } from 'expo-router';
import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { Toggle } from '@components/nativewindui/Toggle';
import { cn } from '@lib/cn';
import messaging, { getMessaging } from '@react-native-firebase/messaging';

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = React.useState({
        push: true,
        email: false,
    });

    function onValueChange(type: 'push' | 'email') {
        return (value: boolean) => {
            setNotifications((prev) => ({ ...prev, [type]: value }));
        };
    }

    const canSave = !notifications.push || notifications.email;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Notifications',
                    headerTransparent: Platform.OS === 'ios',
                    headerBlurEffect: 'systemMaterial',
                    // headerRight: Platform.select({
                    //     ios: () => (
                    //         <Button
                    //             className="ios:px-0"
                    //             disabled={!canSave}
                    //             variant="plain"
                    //             onPress={() => {
                    //                 router.back();
                    //             }}>
                    //             <Text className={cn(canSave && 'text-primary')}>Save</Text>
                    //         </Button>
                    //     ),
                    // }),
                }}
            />

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <Form className="gap-5 px-4 pt-8">
                    <FormSection>
                        <PushNotificationToggle />
                        {/* <FormItem className="ios:px-4 ios:pb-2 ios:pt-2 flex-row justify-between px-2 pb-4">
                            <View className="w-40 flex-row items-center justify-between">
                                <Text className="font-medium">Email Notifications</Text>
                            </View>
                            <Toggle value={notifications.email} onValueChange={onValueChange('email')} />
                        </FormItem> */}
                    </FormSection>
                </Form>
            </ScrollView>
        </>
    );
}

const PushNotificationToggle = () => {

    const [enabled, setEnabled] = React.useState(false);

    React.useEffect(() => {
        messaging().hasPermission().then((hasPermission) => {
            setEnabled(hasPermission === messaging.AuthorizationStatus.AUTHORIZED);
        });
    }, []);

    const onToggle = React.useCallback(() => {
        getMessaging().requestPermission().then((authorizationStatus: -1 | 0 | 1) => {
            console.log('authorizationStatus', authorizationStatus);
        }).then(() => {
            messaging().getToken().then((token) => {
                console.log('token', token);
            });
        })
    }, []);

    return <FormItem className="ios:px-4 ios:pb-2 ios:pt-2 flex-row justify-between px-2 pb-4">
        <View className="w-40 flex-row items-center justify-between">
            <Text className="font-medium">Push Notifications</Text>
        </View>
        <Toggle value={enabled} onValueChange={onToggle} />
    </FormItem>

}
