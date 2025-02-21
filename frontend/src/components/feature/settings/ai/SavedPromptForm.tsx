import { ErrorText, HelperText, Label } from '@/components/common/Form'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBotAIPrompt } from '@/types/RavenAI/RavenBotAIPrompt'
import { Box, Checkbox, Text, TextArea } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import AINotEnabledCallout from './AINotEnabledCallout'

const SavedPromptForm = () => {

    const { register, control, formState: { errors } } = useFormContext<RavenBotAIPrompt>()

    return (
        <Stack gap='4'>
            <AINotEnabledCallout />
            <Stack>
                <Box>
                    <Label htmlFor='prompt' isRequired>Prompt</Label>
                    <TextArea
                        id='prompt'
                        {...register('prompt', {
                            required: 'Prompt is required',
                        })}
                        autoFocus
                        rows={5}
                        resize='vertical'
                        placeholder="Can you create purchase invoices from these files?"
                        aria-invalid={errors.prompt ? 'true' : 'false'}
                    />
                </Box>
                {errors.prompt && <ErrorText>{errors.prompt?.message}</ErrorText>}
            </Stack>
            <Stack maxWidth={'480px'}>
                <Text as="label" size="2">
                    <HStack>
                        <Controller
                            control={control}
                            name='is_global'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />

                        Is Global
                    </HStack>
                </Text>
                <HelperText>
                    If checked, this prompt will be available to all users on Raven
                </HelperText>
            </Stack>
            <Stack maxWidth={'480px'}>
                <LinkFormField
                    name='raven_bot'
                    dropdownClass='max-w-[480px]'
                    label='Agent'
                    filters={[["is_ai_bot", "=", 1]]}
                    doctype="Raven Bot"
                />
                <HelperText>
                    If added, this prompt will only be shown when interacting with the agent
                </HelperText>
                <ErrorText>{errors.raven_bot?.message}</ErrorText>
            </Stack>
        </Stack>
    )
}

export default SavedPromptForm