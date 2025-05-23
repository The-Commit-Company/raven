import { Label, ErrorText, HelperText } from '@/components/common/Form'
import { Stack, HStack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Box, TextField, Checkbox, Text, Separator, Tooltip, Heading, Select, Slider, Code } from '@radix-ui/themes'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useFormContext, Controller } from 'react-hook-form'
import { BiInfoCircle } from 'react-icons/bi'

type Props = {}

const AIFeaturesBotForm = (props: Props) => {
    const { register, control, formState: { errors }, watch } = useFormContext<RavenBot>()

    const openAIAssistantID = watch('openai_assistant_id')

    const temperature = watch('temperature')
    const top_p = watch('top_p')

    return (
        <Stack gap='4'>
            <Stack maxWidth={'480px'}>
                <Box hidden={!openAIAssistantID}>
                    <Label htmlFor='openai_assistant_id'>OpenAI Assistant ID</Label>
                    <TextField.Root
                        id='openai_assistant_id'
                        {...register('openai_assistant_id')}
                        readOnly
                        placeholder="asst_*******************"
                        aria-invalid={errors.openai_assistant_id ? 'true' : 'false'}
                    />
                </Box>
                {errors.openai_assistant_id && <ErrorText>{errors.openai_assistant_id?.message}</ErrorText>}
            </Stack>
            <HStack gap='8'>
                <ModelSelector />
                <ReasoningEffortSelector />
            </HStack>
            <Separator className='w-full' />
            <Stack maxWidth={'480px'}>
                <Text as="label" size="2">
                    <HStack>
                        <Controller
                            control={control}
                            name='allow_bot_to_write_documents'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />

                        Allow Agent to Write Documents
                    </HStack>
                </Text>
                <HelperText>
                    Checking this will allow the bot to create/update/delete documents in the system.
                </HelperText>
            </Stack>
            <Separator className='w-full' />
            <HStack gap='8'>
                <Stack>
                    <Text as="label" size="2">
                        <HStack align='center'>
                            <Controller
                                control={control}
                                name='enable_file_search'
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value ? true : false}
                                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    />
                                )} />
                            <span>Enable File Search</span>
                            <Tooltip content='View OpenAI documentation about File Search'>
                                <a href='https://platform.openai.com/docs/assistants/tools/file-search'
                                    title='View OpenAI documentation about File Search'
                                    aria-label='View OpenAI documentation about File Search'
                                    target='_blank' className='text-gray-11 -mb-1'>
                                    <BiInfoCircle size={16} /></a>
                            </Tooltip>

                        </HStack>
                    </Text>
                    <HelperText>
                        Enable this if you want the bot to be able to read PDF files and scan them.
                        <br /><br />
                        File search enables the assistant with knowledge from files that you upload.
                        <br />
                        Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.
                    </HelperText>
                </Stack>
                <Stack>
                    <Text as="label" size="2">
                        <HStack align='center'>
                            <Controller
                                control={control}
                                name='enable_code_interpreter'
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value ? true : false}
                                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    />
                                )} />
                            <span>Enable Code Interpreter</span>
                            <Tooltip content='View OpenAI documentation about Code Interpreter'>
                                <a href='https://platform.openai.com/docs/assistants/tools/code-interpreter'
                                    title='View OpenAI documentation about Code Interpreter'
                                    aria-label='View OpenAI documentation about Code Interpreter'
                                    target='_blank' className='text-gray-11 -mb-1'>
                                    <BiInfoCircle size={16} /></a>
                            </Tooltip>

                        </HStack>
                    </Text>
                    <HelperText>
                        Enable this if you want the bot to be able to process files like Excel sheets or data from Insights.
                        <br /><br />
                        OpenAI Assistants run code in a sandboxed environment (on OpenAI servers) to do this.
                    </HelperText>
                </Stack>
            </HStack>
            <Separator className='w-full' />
            <Heading as='h5' size='3' className='not-cal' weight='bold'>Advanced</Heading>
            <Stack maxWidth={'560px'}>
                <Text as="label" size="2">
                    <HStack align='center'>
                        <Controller
                            control={control}
                            name='debug_mode'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />
                        <span>Enable Debug Mode</span>
                    </HStack>
                </Text>
                <HelperText>
                    If enabled, stack traces of errors will be sent as messages by the bot during runs.
                    <br />
                    This is helpful when you're testing your bots and want to know where things are going wrong.
                </HelperText>
            </Stack>

            <HStack gap='8' align='start'>
                <Stack maxWidth={'560px'}>
                    <HStack justify='between' align='center'>
                        <Label htmlFor='temperature'>Temperature <Text as='span' color='gray' weight='regular'>(Default: 1)</Text></Label>
                        <Code color='gray' size='2' variant='ghost' weight='regular'>{(temperature ?? 1).toFixed(2)}</Code>
                    </HStack>
                    <Controller control={control} name='temperature' render={({ field }) => (
                        <Slider color='gray' variant='soft' value={[field.value ?? 1]} defaultValue={[1]} className='w-full' min={0} max={2} step={0.01} name={field.name} onValueChange={(value) => field.onChange(value[0])} />
                    )} />
                    <HelperText>
                        What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
                    </HelperText>
                </Stack>

                <Stack maxWidth={'560px'}>
                    <HStack justify='between' align='center'>
                        <Label htmlFor='top_p'>Top P <Text as='span' color='gray' weight='regular'>(Default: 1)</Text></Label>
                        <Code color='gray' variant='ghost' size='2' weight='regular'>{(top_p ?? 1).toFixed(2)}</Code>
                    </HStack>
                    <Controller control={control} name='top_p' render={({ field }) => (
                        <Slider variant='soft' color='gray' value={[field.value ?? 1]} defaultValue={[1]} className='w-full' min={0} max={1} step={0.01} name={field.name} onValueChange={(value) => field.onChange(value[0])} />
                    )} />
                    <HelperText>
                        An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.
                        <br /><br />
                        We generally recommend altering this or temperature but not both.
                    </HelperText>
                </Stack>
            </HStack>

        </Stack>
    )
}

const ModelSelector = () => {

    const { data: models } = useFrappeGetCall('raven.api.ai_features.get_openai_available_models', undefined, undefined, {
        revalidateOnFocus: false,
        revalidateIfStale: false
    })
    const { control, formState: { errors }, watch } = useFormContext<RavenBot>()

    const is_ai_bot = watch('is_ai_bot')


    return <Stack maxWidth={'480px'}>
        <Box>
            <Label htmlFor='model' isRequired>Model</Label>
            <Controller control={control} name='model'
                rules={{
                    required: is_ai_bot ? true : false
                }}
                defaultValue='gpt-4o'
                render={({ field }) => (
                    <Select.Root
                        value={field.value}
                        name={field.name}
                        onValueChange={(value) => field.onChange(value)}>
                        <Select.Trigger placeholder='Select Model' className='w-full' />
                        <Select.Content>
                            {models?.message.map((model: string) => (
                                <Select.Item key={model} value={model}>{model}</Select.Item>
                            )) || <Select.Item value='gpt-4o'>gpt-4o</Select.Item>}
                        </Select.Content>
                    </Select.Root>
                )} />
        </Box>
        {errors.model && <ErrorText>{errors.model?.message}</ErrorText>}
        <HelperText>
            The model you select will be used to run the agent.
            <br />
            The model should be compatible with the OpenAI Assistants API. We recomment using models in the GPT-4 family for best results.
        </HelperText>
    </Stack>
}

const ReasoningEffortSelector = () => {
    const { control, watch } = useFormContext<RavenBot>()

    const model = watch('model')

    const is_ai_bot = watch('is_ai_bot')

    if (!model) return null

    if (model.startsWith("o")) {
        return <Stack maxWidth={'480px'}>
            <Box>
                <Label htmlFor='reasoning_effort' isRequired>Reasoning Effort</Label>
                <Controller control={control}
                    rules={{
                        required: model.startsWith("o") && is_ai_bot ? true : false
                    }}
                    name='reasoning_effort' render={({ field }) => (
                        <Select.Root value={field.value} name={field.name} onValueChange={(value) => field.onChange(value)}>
                            <Select.Trigger placeholder='Select Reasoning Effort' className='w-full' />
                            <Select.Content>
                                <Select.Item value='low'>Low</Select.Item>
                                <Select.Item value='medium'>Medium</Select.Item>
                                <Select.Item value='high'>High</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    )} />
            </Box>
            <HelperText>
                The reasoning effort will be used to determine the depth of the reasoning process. This is only applicable for OpenAI's o-series models.
            </HelperText>
        </Stack>
    }
    return null
}

export default AIFeaturesBotForm