import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { useFrappePostCall } from 'frappe-react-sdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { TextField } from '@components/nativewindui/TextField';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import { toast } from 'sonner-native';
import { useColorScheme } from '@hooks/useColorScheme';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function CustomStatusScreen() {

    const { myProfile, mutate } = useCurrentRavenUser()

    const insets = useSafeAreaInsets()
    const [customStatus, setCustomStatus] = useState(myProfile?.custom_status ?? '')

    const { call, loading } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const handleCustomStatusUpdate = async () => {
        call({
            custom_status: customStatus
        }).then(() => {
            toast.success("Status updated")
            mutate()
            router.back()
        }).catch(() => {
            toast.error("Failed to update status")
        })
    }

    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft() {
                        return (
                            <HeaderBackButton />
                        )
                    },
                    headerTitle: () => <Text className='ml-2 text-base font-semibold'>Custom Status</Text>,
                    headerRight() {
                        return (
                            <Button variant="plain" className="ios:px-0"
                                onPress={handleCustomStatusUpdate}
                                disabled={loading}>
                                {loading ?
                                    <ActivityIndicator size="small" color={colors.primary} /> :
                                    <Text className="text-primary dark:text-secondary">Save</Text>}
                            </Button>
                        )
                    },
                    headerStyle: { backgroundColor: colors.background },
                }} />
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
                                leftView={
                                    <View className="w-36 justify-between flex-row items-center pl-2">
                                        <Text className="font-medium">Custom Status</Text>
                                    </View>
                                }
                                placeholder="e.g. Out of Office"
                                value={customStatus}
                                onChangeText={setCustomStatus}
                            />
                        </FormItem>
                    </FormSection>
                </Form>
            </KeyboardAwareScrollView>
        </>
    )
}


export const ErrorBoundary = CommonErrorBoundary