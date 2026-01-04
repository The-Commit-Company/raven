import { useFormContext, Controller, useFieldArray, FieldError } from 'react-hook-form';
import { View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { ErrorText, FormLabel } from '@components/layout/Form';
import { Checkbox } from '@components/nativewindui/Checkbox';
import { useColorScheme } from '@hooks/useColorScheme';
import TrashIcon from "@assets/icons/TrashIcon.svg"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

type PollFormData = {
    question: string,
    options: { option: string }[],
    is_multi_choice: boolean,
    is_anonymous: boolean
}

const CreatePollForm = () => {
    const { t } = useTranslation()
    const { colors } = useColorScheme();
    const { control, formState: { errors }, setValue } = useFormContext<PollFormData>()

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options'
    })

    const handleAddOption = () => {
        if (fields.length < 10) {
            append({ option: '' })
        }
    }

    const handleRemoveOption = (index: number) => {
        if (fields.length > 2) {
            remove(index)
        }
    }

    const onCheckedChange = (checked: boolean, field: string) => {
        setValue(field as keyof PollFormData, checked)
    }

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentInsetAdjustmentBehavior="automatic">

            <View className='p-5 gap-5'>
                <Text className="text-base">
                    {t('polls.pollDescription')}
                </Text>

                <View className='flex-col gap-2'>
                    <FormLabel isRequired>{t('polls.question')}</FormLabel>
                    <Controller
                        name="question"
                        control={control}
                        rules={{ required: t('polls.questionRequired') }}
                        render={({ field }) => (
                            <TextInput
                                className="w-full border border-border rounded-lg px-3 py-3 text-[16px] leading-5 text-foreground"
                                placeholder={t('polls.questionPlaceholder')}
                                placeholderTextColor={colors.grey}
                                placeholderClassName="leading-5"
                                textAlignVertical="top"
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.question ? (
                        <ErrorText>{errors.question.message as string}</ErrorText>
                    ) : null}
                </View>

                <View className='flex-col gap-2'>
                    <FormLabel isRequired>{t('polls.options')}</FormLabel>
                    {fields.map((field, index) => (
                        <View key={field.id} className="flex-col gap-1">
                            <View className='flex-row justify-between items-center gap-2'>
                                <Controller
                                    name={`options.${index}.option`}
                                    control={control}
                                    rules={{ required: t('polls.optionRequired', { number: index + 1 }) }}
                                    render={({ field }) => (
                                        <TextInput
                                            className="flex-1 border border-border rounded-lg px-3 py-3 text-[16px] leading-5 text-foreground"
                                            placeholder={t('polls.optionPlaceholder', { number: index + 1 })}
                                            placeholderTextColor={colors.grey}
                                            placeholderClassName="leading-5"
                                            textAlignVertical="top"
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                            value={field.value}
                                        />
                                    )}
                                />
                                <TouchableOpacity activeOpacity={0.6} disabled={fields.length === 2} onPress={() => handleRemoveOption(index)}>
                                    <TrashIcon width={20} height={20} fill={fields.length === 2 ? colors.grey3 : colors.destructive} />
                                </TouchableOpacity>
                            </View>

                            {errors?.options?.[index]?.option ? (
                                <ErrorText>{(errors.options[index].option as FieldError).message}</ErrorText>
                            ) : null}
                        </View>
                    ))}

                    <View className='flex flex-row justify-between'>
                        <TouchableOpacity activeOpacity={0.6} disabled={fields.length >= 10} onPress={handleAddOption}>
                            <View className='flex flex-row items-center'>
                                <PlusIcon width={18} height={18} fill={`${fields.length >= 10 ? colors.grey : colors.primary}`} />
                                <Text className={`text-sm pl-0.5 ${fields.length >= 10 ? 'text-muted-foreground/80' : 'font-semibold text-primary dark:text-secondary'}`}>
                                    {t('polls.addOption')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-muted-foreground/80 text-sm">{t('polls.maxOptionsReached')}</Text>
                    </View>
                </View>

                <View className='flex-col gap-2'>
                    <FormLabel>{t('common.settings')}</FormLabel>
                    <Controller
                        name="is_multi_choice"
                        control={control}
                        defaultValue={false}
                        render={({ field: { value, name } }) => (
                            <Pressable onPress={() => onCheckedChange(!value, name)} className="flex-row items-center gap-2">
                                <Checkbox checked={value} />
                                <Text className='text-base'>{t('polls.multipleChoice')}</Text>
                            </Pressable>
                        )}
                    />
                    <Controller
                        name="is_anonymous"
                        control={control}
                        defaultValue={false}
                        render={({ field: { value, name } }) => (
                            <Pressable onPress={() => onCheckedChange(!value, name)} className="flex-row items-center gap-2">
                                <Checkbox checked={value} />
                                <Text className='text-base'>{t('polls.anonymous')}</Text>
                            </Pressable>
                        )}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}

export default CreatePollForm