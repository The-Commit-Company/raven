import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Controller, useFormContext } from 'react-hook-form';
import { useCallback, useMemo } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { ErrorText, FormLabel } from "@components/layout/Form";
import { ChannelIcon } from "../ChannelList/ChannelIcon";
import { useColorScheme } from "@hooks/useColorScheme";
import { useTranslation } from "react-i18next";

export type ChannelCreationForm = {
    channel_name: string,
    channel_description: string,
    type: 'Public' | 'Private' | 'Open'
}

const CreateChannelForm = () => {

    const { t } = useTranslation()
    const { control, formState: { errors }, setValue, watch } = useFormContext<ChannelCreationForm>()

    const handleNameChange = useCallback((text: string) => {
        setValue('channel_name', text?.toLowerCase().replace(' ', '-'))
    }, [setValue])

    const channelType = watch('type')

    const { header, helperText } = useMemo(() => {
        switch (channelType) {
            case 'Private':
                return {
                    header: t('channels.createPrivateChannel'),
                    helperText: t('channels.privateChannelHelperText')
                }
            case 'Open':
                return {
                    header: t('channels.createOpenChannel'),
                    helperText: t('channels.openChannelHelperText')
                }
            default:
                return {
                    header: t('channels.createPublicChannel'),
                    helperText: t('channels.publicChannelHelperText')
                }
        }
    }, [channelType, t])

    const { colors } = useColorScheme()

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentInsetAdjustmentBehavior="automatic">

            <View className="flex-col gap-3 justify-start px-5 pt-5 pb-6">
                <Text className="text-xl font-cal-sans">
                    {header}
                </Text>
                <Text className="text-sm">{t('channels.channelTypeDescription')}</Text>
            </View>

            <View className="px-5 gap-6">


                <View className="flex-col gap-2">
                    <FormLabel isRequired>{t('common.name')}</FormLabel>
                    <Controller
                        name="channel_name"
                        control={control}
                        rules={{
                            required: t('channels.validation.nameRequired'),
                            maxLength: {
                                value: 50,
                                message: t('channels.validation.nameTooLong'),
                            },
                            minLength: {
                                value: 3,
                                message: t('channels.validation.nameTooShort'),
                            },
                            pattern: {
                                // no special characters allowed, cannot start with a space
                                value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                message: t('channels.validation.nameInvalid'),
                            },
                        }}
                        render={({ field: { onBlur, value }, fieldState: { error } }) => (
                            <View className={`flex-row items-center rounded-lg border ${error ? "border-red-600" : "border-border"}`}>
                                {/* Channel Icon */}
                                <View className="mx-3">
                                    <ChannelIcon type={channelType} fill={colors.icon} />
                                </View>
                                <TextInput
                                    className={`flex-1 pt-2 pb-2 text-[16px] text-foreground`}
                                    placeholder={t('channels.channelNamePlaceholder')}
                                    placeholderTextColor={colors.grey}
                                    maxLength={50}
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={handleNameChange}
                                    autoFocus
                                    accessibilityHint={error ? t('channels.validation.nameInvalid') : undefined}
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
                        <FormLabel>{t('channels.channelDescription')}</FormLabel>
                        <Text className="text-sm">({t('channels.optional')})</Text>
                    </View>
                    <Controller
                        control={control}
                        name="channel_description"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="w-full border min-h-24 border-border rounded-lg px-3 pt-2 pb-2 text-[16px] leading-5 text-foreground"
                                placeholder={t('channels.channelDescriptionPlaceholder')}
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
                    <Text className="text-sm text-muted-foreground">{t('channels.channelDescriptionHelper')}</Text>
                    {errors?.channel_description && (
                        <ErrorText>{errors.channel_description?.message}</ErrorText>
                    )}
                </View>

                <View className="flex-col gap-3">
                    <FormLabel>{t('channels.channelType')}</FormLabel>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row flex-wrap gap-6">
                                {(["Public", "Private", "Open"] as const).map((option) => {
                                    const isSelected = value === option;
                                    const label = option === 'Public' ? t('channels.publicChannel') : option === 'Private' ? t('channels.privateChannel') : t('channels.openChannel');
                                    return (
                                        <TouchableOpacity key={option} onPress={() => onChange(option)}>
                                            <View className="flex-row items-center gap-2">
                                                <View className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-border"}`}>
                                                    {isSelected && (
                                                        <View className="w-[8px] h-[8px] bg-primary rounded-full" />
                                                    )}
                                                </View>
                                                <Text className="text-sm">{label}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        )}
                    />
                    <Text className="text-sm text-muted-foreground">{helperText}</Text>
                </View>

            </View>
        </KeyboardAwareScrollView>
    )
}

export default CreateChannelForm