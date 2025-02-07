import { ErrorText, FormLabel } from "@components/layout/Form";
import { Form, FormSection } from "@components/nativewindui/Form";
import { Text } from "@components/nativewindui/Text";
import { TextField } from "@components/nativewindui/TextField";
import { View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Controller, useFormContext } from 'react-hook-form';
import { ChannelIcon } from "@components/features/channels/ChannelList/ChannelIcon";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@hooks/useColorScheme";
import { useLocalSearchParams } from "expo-router";
import { useCurrentChannelData } from "@hooks/useCurrentChannelData";

export type EditChannelDetailsForm = {
    channel_name: string
    channel_description: string
}

const EditChannelBaseDetailsForm = () => {

    const { control, formState: { errors }, setValue } = useFormContext<EditChannelDetailsForm>()

    const handleNameChange = useCallback((text: string) => {
        setValue('channel_name', text?.toLowerCase().replace(' ', '-'))
    }, [setValue])

    const { colors } = useColorScheme()
    const insets = useSafeAreaInsets()

    const { id: currentChannelID } = useLocalSearchParams()

    const { channel } = useCurrentChannelData(currentChannelID as string ?? "")

    return (
        <KeyboardAwareScrollView
            bottomOffset={8}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: insets.bottom }}>
            <Form className="gap-4 p-4">

                <FormSection footnote="Choose unique channel name.">
                    <View className="py-4 px-3 dark:bg-background">
                        <FormLabel isRequired>Channel Name</FormLabel>
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
                                            onChangeText={handleNameChange}
                                        />
                                    </View>
                                    <View className="pr-3 pl-1">
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

                <FormSection>
                    <View className="py-4 px-3 dark:bg-background">
                        <FormLabel isRequired>Channel Description</FormLabel>
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
                                            className="px-3"
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
            </Form>
        </KeyboardAwareScrollView>
    )
}

export default EditChannelBaseDetailsForm