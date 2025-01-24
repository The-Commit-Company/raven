import { ErrorText, FormLabel } from "@components/layout/Form";
import { Button } from "@components/nativewindui/Button";
import { Form, FormSection } from "@components/nativewindui/Form";
import { Text } from "@components/nativewindui/Text";
import { TextField } from "@components/nativewindui/TextField";
import { useColorScheme } from "@hooks/useColorScheme";
import { cn } from "@lib/cn";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useCallback, useState } from "react";
import { View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Controller, FormProvider, useForm } from 'react-hook-form';
import { ChannelIcon } from "@components/features/channels/ChannelList/ChannelIcon";
import { useCurrentChannelData } from "@hooks/useCurrentChannelData";
import { toast } from "sonner-native";


const ChannelNameEdit = () => {
    const { colors } = useColorScheme()
    const insets = useSafeAreaInsets();

    const { id: currentChannelID } = useLocalSearchParams();

    const { channel } = useCurrentChannelData(currentChannelID as string ?? "")

    const currentChannelName = channel?.channelData.channel_name ?? ""

    const methods = useForm({
        defaultValues: {
            channel_name: currentChannelName,
        }
    });

    const { control, handleSubmit, formState: { errors }, setValue, watch } = methods;

    const channelName = watch("channel_name")

    const canSave = !!channelName && channelName !== currentChannelName

    const { updateDoc } = useFrappeUpdateDoc()

    const handleEditChannelName = () => {
        return updateDoc("Raven Channel", currentChannelID as string, {
            channel_name: channelName ?? currentChannelName,
        }).then(() => {
            toast.success("Channel name updated")
            router.back();
        }).catch(() => {
            toast.error("Error while updating channel name")
        })
    }

    const handleEditChannelNameChange = useCallback((text: string) => {
        setValue('channel_name', text?.toLowerCase().replace(' ', '-'))
    }, [setValue])

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
                        <FormSection footnote="Choose unique channel name.">
                            <View className="p-2.5">
                                <FormLabel isRequired>Edit Channel Name</FormLabel>
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
                                        <View className={`mt-2.5 flex-row items-center rounded-md border ${error ? "border-red-600" : "border-border"}`}>
                                            <View className="mx-3">
                                                <ChannelIcon type={channel?.channelData.type ?? ""} fill={colors.icon} />
                                            </View>
                                            <View className="flex-1">
                                                <TextField
                                                    autoFocus
                                                    className="pl-0.5"
                                                    label={Platform.select({ ios: undefined, default: 'First' })}
                                                    placeholder="Channel name"
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={handleEditChannelNameChange}
                                                />
                                            </View>
                                            <View className="px-3">
                                                <Text className={`text-sm ${error ? "text-red-600" : "text-gray-500"}`}>
                                                    {50 - (value?.length || 0)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>

                            {errors?.channel_name && (
                                <ErrorText>{errors.channel_name?.message}</ErrorText>
                            )}
                        </FormSection>

                        {Platform.OS !== 'ios' && (
                            <View className="items-end">
                                <Button
                                    className={cn('px-6', !canSave && 'bg-muted')}
                                    disabled={!canSave}
                                    onPress={handleSubmit(handleEditChannelName)}
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