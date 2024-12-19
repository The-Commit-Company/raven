import { router, Stack } from 'expo-router';
import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { Toggle } from '@components/nativewindui/Toggle';
import { cn } from '@lib/cn';

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
                    headerRight: Platform.select({
                        ios: () => (
                            <Button
                                className="ios:px-0"
                                disabled={!canSave}
                                variant="plain"
                                onPress={() => {
                                    router.back();
                                }}>
                                <Text className={cn(canSave && 'text-primary')}>Save</Text>
                            </Button>
                        ),
                    }),
                }}
            />

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <Form className="gap-5 px-4 pt-8">
                    <FormSection
                        footnote="Receive communication including announcements, marketing, recommendations, and updates about products, services, and software.">
                        <FormItem className="ios:px-4 ios:pb-2 ios:pt-2 flex-row justify-between px-2 pb-4">
                            <View className="w-40 flex-row items-center justify-between">
                                <Text className="font-medium">Push Notifications</Text>
                            </View>
                            <Toggle value={notifications.push} onValueChange={onValueChange('push')} />
                        </FormItem>
                        <FormItem className="ios:px-4 ios:pb-2 ios:pt-2 flex-row justify-between px-2 pb-4">
                            <View className="w-40 flex-row items-center justify-between">
                                <Text className="font-medium">Email Notifications</Text>
                            </View>
                            <Toggle value={notifications.email} onValueChange={onValueChange('email')} />
                        </FormItem>
                    </FormSection>
                    {Platform.OS !== 'ios' && (
                        <View className="items-end">
                            <Button
                                className={cn('px-6', !canSave && 'bg-muted')}
                                disabled={!canSave}
                                onPress={() => {
                                    router.back();
                                }}>
                                <Text>Save</Text>
                            </Button>
                        </View>
                    )}
                </Form>
            </ScrollView>
        </>
    );
}
