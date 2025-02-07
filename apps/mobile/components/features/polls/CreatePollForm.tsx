import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { ErrorText, FormLabel } from '@components/layout/Form';
import { Checkbox } from '@components/nativewindui/Checkbox';
import { useColorScheme } from '@hooks/useColorScheme';
import TrashIcon from "@assets/icons/TrashIcon.svg"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const CreatePollForm = () => {
    const { colors } = useColorScheme()

    const { control, formState: { errors }, setValue } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options'
    });

    const handleAddOption = () => {
        if (fields.length < 10) {
            append({ option: '' });
        }
    };

    const handleRemoveOption = (index: number) => {
        if (fields.length > 2) {
            remove(index);
        }
    };

    const onCheckedChange = (checked: boolean, field: string) => {
        setValue(field, checked)
    }


    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentInsetAdjustmentBehavior="automatic">

            <View className='px-5 gap-4 pt-5'>
                <Text className="text-sm">
                    Create a quick poll to get everyone's thoughts on a topic.
                </Text>

                <View className='flex-col gap-2'>
                    <FormLabel isRequired>Question</FormLabel>
                    <Controller
                        name="question"
                        control={control}
                        rules={{ required: 'Question is required' }}
                        render={({ field }) => (
                            <TextInput
                                className="w-full border border-border rounded-md px-3 pt-2 pb-3 text-sm"
                                placeholder="Ask a question"
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.question ? (
                        <ErrorText>{errors?.question.message}</ErrorText>
                    ) : null}
                </View>

                <View className='flex-col gap-2'>
                    <FormLabel>Options</FormLabel>
                    {fields.map((field, index) => (
                        <View key={field.id} className="flex-col gap-1">
                            <View className='flex-row justify-between items-center gap-2'>
                                <Controller
                                    name={`options.${index}.option`}
                                    control={control}
                                    rules={{ required: 'Option is required' }}
                                    render={({ field }) => (
                                        <TextInput
                                            className="flex-1 border border-border rounded-md px-3 pt-2 pb-3 text-sm"
                                            placeholder={`Option ${index + 1}`}
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
                                <ErrorText>{errors?.options?.[index]?.option.message}</ErrorText>
                            ) : null}
                        </View>
                    ))}

                    <View className='flex flex-row justify-between'>
                        <TouchableOpacity activeOpacity={0.6} disabled={fields.length >= 10} onPress={handleAddOption}>
                            <View className='flex flex-row items-center'>
                                <PlusIcon width={18} height={18} fill={colors.primary} />
                                <Text className='text-sm pl-1 font-bold' style={{ color: colors.primary }}>
                                    Add Option
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-gray-500 text-sm">Maximum of 10 options allowed</Text>
                    </View>
                </View>

                <View className='flex-col gap-2'>
                    <FormLabel>Settings</FormLabel>

                    <Controller
                        name="is_multi_choice"
                        control={control}
                        render={({ field }) => (
                            <Pressable onPress={() => onCheckedChange(!field.value, field.name)} className="flex-row items-center gap-2">
                                <Checkbox checked={field.value} />
                                <Text>Allow multiple choices</Text>
                            </Pressable>
                        )}
                    />
                    <Controller
                        name="is_anonymous"
                        control={control}
                        render={({ field }) => (
                            <Pressable onPress={() => onCheckedChange(!field.value, field.name)} className="flex-row items-center gap-2">
                                <Checkbox checked={field.value} />
                                <Text>Make poll anonymous</Text>
                            </Pressable>
                        )}
                    />
                </View>

            </View>
        </KeyboardAwareScrollView>
    );
};

export default CreatePollForm;