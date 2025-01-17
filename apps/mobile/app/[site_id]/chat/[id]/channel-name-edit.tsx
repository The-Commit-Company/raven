import { ErrorText, FormLabel } from "@components/layout/Form";
import { Button } from "@components/nativewindui/Button";
import { Form, FormItem, FormSection } from "@components/nativewindui/Form";
import { Text } from "@components/nativewindui/Text";
import { TextField } from "@components/nativewindui/TextField";
import { useColorScheme } from "@hooks/useColorScheme";
import { cn } from "@lib/cn";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useState } from "react";
import { View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Controller, FormProvider, useForm } from 'react-hook-form';


const ChannelNameEdit = () => {
    const { colors } = useColorScheme()
    const insets = useSafeAreaInsets();

    const { id: currentChannelName } = useLocalSearchParams();

    const methods = useForm({
        defaultValues: {
            channel_name: currentChannelName,
        }
    });

    const { control, handleSubmit, formState: { errors } } = methods;

    const [channelName, setChannelName] = useState(currentChannelName ?? "");

    const canSave = !!channelName && channelName !== currentChannelName;

    const { updateDoc } = useFrappeUpdateDoc()

    const handleEditChannelName = () => {
        return updateDoc("Raven Channel", currentChannelName as string, {
            channel_name: channelName,
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
                    title: 'Edit Channel Name',
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
                                onPress={handleEditChannelName}
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
                        <FormSection footnote="Choose unique name which indentifies you.">
                            {/* <FormItem>
                            <TextField
                                autoFocus
                                className="pl-0.5"
                                label={Platform.select({ ios: undefined, default: 'First' })}
                                leftView={
                                    <View className="ios:w-36 ios:justify-between flex-row items-center pl-2">
                                        {Platform.OS === 'ios' && <Text className="font-medium">Channel Name</Text>}
                                    </View>
                                }
                                placeholder="Channel Name"
                                value={channelName as string}
                                onChangeText={setChannelName}
                            />
                        </FormItem> */}
                            <FormLabel isRequired>Name</FormLabel>
                            <Controller
                                name="channel_name"
                                control={control}
                                rules={{
                                    required: "Please add a channel name",
                                    maxLength: {
                                        value: 50,
                                        message: "Channel name cannot be more than 50 characters.",
                                    },
                                    minLength: {
                                        value: 3,
                                        message: "Channel name cannot be less than 3 characters.",
                                    },
                                    pattern: {
                                        // no special characters allowed, cannot start with a space
                                        value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                        message: "Channel name can only contain letters, numbers and hyphens.",
                                    },
                                }}
                                render={({ field: { onBlur, value }, fieldState: { error } }) => (
                                    <View className={`flex-row items-center rounded-md border ${error ? "border-red-600" : "border-border"}`}>
                                        {/* Channel Icon */}
                                        <View className="mx-3">
                                            {/* <ChannelIcon type={channelType} fill={colors.icon} /> */}
                                        </View>
                                        <TextField
                                            autoFocus
                                            className="pl-0.5"
                                            label={Platform.select({ ios: undefined, default: 'First' })}
                                            leftView={
                                                <View className="ios:w-36 ios:justify-between flex-row items-center pl-2">
                                                    {Platform.OS === 'ios' && <Text className="font-medium">Channel Name</Text>}
                                                </View>
                                            }
                                            placeholder="Channel Name"
                                            value={'channel_name'}
                                            onChangeText={handleEditChannelName}
                                        />
                                        {/* <TextInput
                                            className={`flex-1 pt-2 pb-3 text-sm`}
                                            placeholder="dev-team"
                                            maxLength={50}
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={handleNameChange}
                                            autoFocus
                                            accessibilityHint={error ? "Channel name is invalid. Please check the error." : undefined}
                                            aria-invalid={error ? "true" : "false"}
                                        /> */}
                                        {/* Character counter */}
                                        <View className="mx-3">
                                            <Text className={`text-sm ${error ? "text-red-600" : "text-gray-500"}`}>
                                                {50 - (value?.length || 0)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            />

                            {errors?.channel_name && (
                                <ErrorText>{errors.channel_name?.message}</ErrorText>
                            )}
                        </FormSection>
                        {Platform.OS !== 'ios' && (
                            <View className="items-end">
                                <Button
                                    className={cn('px-6', !canSave && 'bg-muted')}
                                    disabled={!canSave}
                                    onPress={handleEditChannelName}
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

export default ChannelNameEdit;