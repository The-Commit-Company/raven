import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { useFrappeUpdateDoc } from 'frappe-react-sdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { TextField } from '@components/nativewindui/TextField';
import { cn } from '@lib/cn';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

export default function CustomStatusScreen() {

    const { myProfile, mutate } = useCurrentRavenUser()

    const insets = useSafeAreaInsets();
    const [customStatus, setCustomStatus] = useState(myProfile?.custom_status ?? "");

    const canSave = !!customStatus && customStatus !== myProfile?.custom_status;

    const { updateDoc } = useFrappeUpdateDoc()

    const handleFullNameSave = async () => {
        return updateDoc("Raven User", myProfile?.name ?? null, {
            custom_status: customStatus,
        }).then(() => {
            // toast.success(__("Custom status updated"))
            mutate()
            router.back();
        }).catch(() => {
            // toast.error(__("Custom status update failed"))
        })
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Custom Status',
                    headerTransparent: Platform.OS === 'ios',
                    headerBlurEffect: 'systemMaterial',
                    headerRight: Platform.select({
                        ios: () => (
                            <Button
                                className="ios:px-0"
                                disabled={!canSave}
                                variant="plain"
                                onPress={handleFullNameSave}
                            >
                                <Text className={cn(canSave && 'text-primary dark:text-secondary')}>Save</Text>
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
                    <FormSection footnote="Share what you are up to.">
                        <FormItem>
                            <TextField
                                autoFocus
                                className="pl-0.5"
                                label={Platform.select({ ios: undefined, default: 'First' })}
                                leftView={
                                    <View className="ios:w-36 ios:justify-between flex-row items-center pl-2">
                                        {Platform.OS === 'ios' && <Text className="font-medium">Custom Status</Text>}
                                    </View>
                                }
                                placeholder="e.g. Out of Office"
                                value={customStatus}
                                onChangeText={setCustomStatus}
                            />
                        </FormItem>
                    </FormSection>
                    {Platform.OS !== 'ios' && (
                        <View className="items-end">
                            <Button
                                className={cn('px-6', !canSave && 'bg-muted')}
                                disabled={!canSave}
                                onPress={handleFullNameSave}
                            >
                                <Text>Save</Text>
                            </Button>
                        </View>
                    )}
                </Form>
            </KeyboardAwareScrollView>
        </>
    );
}
