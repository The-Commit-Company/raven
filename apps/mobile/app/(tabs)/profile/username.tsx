import { router, Stack } from 'expo-router';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { TextField } from '@components/nativewindui/TextField';
import { cn } from '@lib/cn';

export default function UsernameScreen() {
    const insets = useSafeAreaInsets();
    const [username, setUsername] = React.useState('mrzachnugent');

    const canSave = !!username && username !== 'mrzachnugent';
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Username',
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

            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <Form className="gap-5 px-4 pt-8">
                    <FormSection
                        // materialIconProps={{ name: 'account-circle-outline' }}
                        footnote="Choose a unique identifier for your account.">
                        <FormItem>
                            <TextField
                                textContentType="username"
                                autoFocus
                                autoComplete="username"
                                className="pl-0.5"
                                label={Platform.select({ ios: undefined, default: 'First' })}
                                leftView={
                                    <View className="ios:w-36 ios:justify-between flex-row items-center pl-2">
                                        {Platform.OS === 'ios' && <Text className="font-medium">Username</Text>}
                                        <Text className="text-muted-foreground">@</Text>
                                    </View>
                                }
                                placeholder="required"
                                value={username}
                                onChangeText={setUsername}
                            />
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
            </KeyboardAwareScrollView>
        </>
    );
}
