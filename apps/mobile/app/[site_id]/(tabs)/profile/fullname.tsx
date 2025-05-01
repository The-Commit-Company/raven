import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { useFrappeUpdateDoc } from 'frappe-react-sdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/nativewindui/Button';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { TextField } from '@components/nativewindui/TextField';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import { useColorScheme } from '@hooks/useColorScheme';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { toast } from 'sonner-native';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function FullNameScreen() {

    const { myProfile, mutate } = useCurrentRavenUser()

    const insets = useSafeAreaInsets()
    const [fullName, setFullName] = useState(myProfile?.full_name ?? '')

    const { updateDoc, loading } = useFrappeUpdateDoc()

    const handleFullNameUpdate = async () => {
        return updateDoc("Raven User", myProfile?.name ?? '', {
            full_name: fullName,
        }).then(() => {
            toast.success("User name updated")
            mutate()
            router.back();
        }).catch(() => {
            toast.error("Failed to update user name")
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
                    headerTitle: () => <Text className='ml-2 text-base font-semibold'>User Name</Text>,
                    headerRight() {
                        return (
                            <Button variant="plain" className="ios:px-0"
                                onPress={handleFullNameUpdate}
                                disabled={loading || !fullName.length}>
                                {loading ?
                                    <ActivityIndicator size="small" color={colors.primary} /> :
                                    <Text className="text-primary dark:text-secondary">Save</Text>}
                            </Button>
                        )
                    },
                    headerStyle: { backgroundColor: colors.background }
                }} />
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <Form className="gap-5 px-4 pt-8">
                    <FormSection footnote="This name will be used to identify you in the app.">
                        <FormItem>
                            <TextField
                                autoFocus
                                className="pl-0.5"
                                leftView={
                                    <View className="w-36 justify-between flex-row items-center pl-2">
                                        <Text className="font-medium">Full Name</Text>
                                    </View>
                                }
                                placeholder="Full Name"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </FormItem>
                    </FormSection>
                </Form>
            </KeyboardAwareScrollView>
        </>
    )
}


export const ErrorBoundary = CommonErrorBoundary