import { Label, ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Box, TextArea, Checkbox, Text, TextField } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import AINotEnabledCallout from '../AINotEnabledCallout'

const GeneralBotForm = () => {
    const { register, control, formState: { errors } } = useFormContext<RavenBot>()

    const { ravenSettings } = useRavenSettings()

    return (
        <Stack gap='4'>
            <Stack maxWidth={'480px'}>
                <Box>
                    <Label htmlFor='bot_name' isRequired>Name</Label>
                    <TextField.Root
                        id='bot_name'
                        {...register('bot_name', {
                            required: 'Name is required',
                        })}
                        autoFocus
                        placeholder="accounts-bot"
                        aria-invalid={errors.bot_name ? 'true' : 'false'}
                    />
                </Box>
                {errors.bot_name && <ErrorText>{errors.bot_name?.message}</ErrorText>}
            </Stack>


            <Stack>
                <Box>
                    <Label htmlFor='description'>Description</Label>
                    <TextArea
                        id='description'
                        {...register('description')}
                        rows={5}
                        resize='vertical'
                        placeholder="A bot to handle accounts"
                        aria-invalid={errors.description ? 'true' : 'false'}
                    />
                </Box>
                {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
            </Stack>

            <AINotEnabledCallout />
            <Stack maxWidth={'480px'}>

                <Text as="label" size="2">
                    <HStack>
                        <Controller
                            control={control}
                            disabled={!ravenSettings?.enable_ai_integration}
                            name='is_ai_bot'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    disabled={field.disabled}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />

                        Is AI Agent
                    </HStack>
                </Text>
                <HelperText>
                    Check to enable AI features for this bot
                </HelperText>
            </Stack>

        </Stack>
    )
}

export default GeneralBotForm