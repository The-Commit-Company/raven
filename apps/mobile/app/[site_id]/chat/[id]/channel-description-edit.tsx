import { ErrorText, FormLabel } from "@components/layout/Form";
import { Button } from "@components/nativewindui/Button";
import { Form, FormSection } from "@components/nativewindui/Form";
import { Text } from "@components/nativewindui/Text";
import { TextField } from "@components/nativewindui/TextField";
import { useColorScheme } from "@hooks/useColorScheme";
import { cn } from "@lib/cn";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useCurrentChannelData } from "@hooks/useCurrentChannelData";

const ChannelDescriptionEdit = () => {
    const { colors } = useColorScheme()
    const insets = useSafeAreaInsets();

    const { id: currentChannelID } = useLocalSearchParams();

    const { channel } = useCurrentChannelData(currentChannelID as string ?? "")

    const currentChannelDescription = channel?.channelData.channel_description ?? ""

    const methods = useForm({
        defaultValues: {
            channel_description: currentChannelDescription,
        }
    });

    const { control, handleSubmit, formState: { errors }, watch } = methods;

    const channelDescription = watch("channel_description")

    const canSave = !!channelDescription && channelDescription !== currentChannelDescription

    const { updateDoc } = useFrappeUpdateDoc()

    const handleEditChannelDescription = () => {
        return updateDoc("Raven Channel", currentChannelID as string, {
            channel_description: channelDescription ?? currentChannelDescription,
        }).then(() => {
            // toast.success(__("Profile updated"))
            // mutate()
            router.back();
        }).catch(() => {
            // toast.error(__("Profile update failed"))
        })
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Edit Channel Description',
                    headerLeft: () => (
                        <Button variant="plain" className="ios:px-0"
                            onPress={() => router.back()}>
                            <Text>Cancel</Text>
                        </Button>
                    ),
                    headerRight: Platform.select({
                        ios: () => (
                            <Button
                                className="ios:px-0"
                                disabled={!canSave}
                                variant="plain"
                                onPress={handleEditChannelDescription}
                            >
                                <Text className={cn(canSave && 'text-primary')}>Save</Text>
                            </Button>
                        ),
                    }),
                    headerStyle: { backgroundColor: colors.background },
                    headerTransparent: Platform.OS === 'ios',
                    headerBlurEffect: 'systemMaterial',
                }} />

            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
            >
                <FormProvider {...methods}>
                    <Form className="gap-5 px-4 pt-8">
                        <FormSection>
                            <View className="p-2.5">
                                <FormLabel isRequired>Edit Channel Description</FormLabel>
                                <Controller
                                    name="channel_description"
                                    control={control}
                                    rules={{
                                        required: "Please add a channel description",
                                    }}
                                    render={({ field: { onBlur, value, onChange }, fieldState: { error } }) => (
                                        <View className={`mt-2.5 flex-row items-center rounded-md border ${error ? "border-red-600" : "border-border"}`}>
                                            <View className="flex-1">
                                                <TextField
                                                    className="px-3.5"
                                                    autoFocus
                                                    label={Platform.select({ ios: undefined, default: 'First' })}
                                                    placeholder="Channel description"
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    multiline
                                                />
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>

                            {errors?.channel_description && (
                                <ErrorText>{errors.channel_description?.message}</ErrorText>
                            )}
                        </FormSection>

                        {Platform.OS !== 'ios' && (
                            <View className="items-end">
                                <Button
                                    className={cn('px-6', !canSave && 'bg-muted')}
                                    disabled={!canSave}
                                    onPress={handleSubmit(handleEditChannelDescription)}
                                >
                                    <Text
                                        className={cn(canSave && 'text-primary')}
                                    >
                                        Save
                                    </Text>
                                </Button>
                            </View>
                        )}
                    </Form>
                </FormProvider>
            </KeyboardAwareScrollView>

        </>
    );
}

export default ChannelDescriptionEdit;