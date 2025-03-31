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
import { TextInput } from "react-native-gesture-handler";

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
            <Form className="p-4 pt-6">

                <View className="flex-col gap-2">
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
                            <View className={`flex-row items-center rounded-lg border ${error ? "border-red-600" : "border-border"}`}>
                                {/* Channel Icon */}
                                <View className="mx-3">
                                    <ChannelIcon type={channel?.type ?? "Public"} fill={colors.icon} />
                                </View>
                                <TextInput
                                    className={`flex-1 pt-2 pb-2 text-[16px] text-foreground`}
                                    placeholder="dev-team"
                                    placeholderTextColor={colors.grey}
                                    maxLength={50}
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={handleNameChange}
                                    autoFocus
                                    accessibilityHint={error ? "Channel name is invalid. Please check the error." : undefined}
                                    aria-invalid={error ? "true" : "false"}
                                />
                                {/* Character counter */}
                                <View className="mx-3">
                                    <Text className={`text-sm ${error ? "text-red-600" : "text-muted-foreground"}`}>
                                        {50 - (value?.length || 0)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />

                    {errors?.channel_name && (
                        <ErrorText>{errors.channel_name?.message}</ErrorText>
                    )}
                </View>

                <View className="flex-col gap-2">
                    <View className="flex-row items-center gap-0">
                        <FormLabel>Description</FormLabel>
                        <Text className="text-sm">(optional)</Text>
                    </View>
                    <Controller
                        control={control}
                        name="channel_description"
                        rules={{
                            maxLength: {
                                value: 140,
                                message: "Channel description cannot be more than 140 characters.",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="w-full border min-h-24 border-border rounded-lg px-3 pt-2 pb-2 text-[16px] leading-5 text-foreground"
                                placeholder="Discuss the latest features and ideas and keep track of the deliverables"
                                placeholderTextColor={colors.grey}
                                placeholderClassName="leading-5"
                                textAlignVertical="top"
                                multiline
                                numberOfLines={6}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                value={value}
                            />
                        )}
                    />
                    <Text className="text-sm text-muted-foreground">What is this channel about?</Text>
                    {errors?.channel_description && (
                        <ErrorText>{errors.channel_description?.message}</ErrorText>
                    )}
                </View>
            </Form>
        </KeyboardAwareScrollView>
    )
}

export default EditChannelBaseDetailsForm