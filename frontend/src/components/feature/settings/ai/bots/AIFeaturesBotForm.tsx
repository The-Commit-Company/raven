import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Box, Callout, Checkbox, Heading, Select, Separator, Text, TextField, Tooltip } from '@radix-ui/themes'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { BiInfoCircle } from 'react-icons/bi'
import { FiAlertTriangle } from 'react-icons/fi'
import { ImSpinner8 } from 'react-icons/im'

type OpenAIModel = {
    id: string
    created: number
    owned_by: string
}

type ModelToolsInfo = {
    model: string
    supported_tools: string[]
    supports_code_interpreter: boolean
    supports_file_search: boolean
    error?: string
}

type Props = {}

const AIFeaturesBotForm = (props: Props) => {
    const { register, control, formState: { errors }, watch, setValue } = useFormContext<RavenBot>()
    const [models, setModels] = useState<OpenAIModel[]>([])
    const [isLoadingModels, setIsLoadingModels] = useState(false)
    const [toolsInfo, setToolsInfo] = useState<ModelToolsInfo | null>(null)
    const [isLoadingToolsInfo, setIsLoadingToolsInfo] = useState(false)

    const isAiBot = watch('is_ai_bot')
    const openAIAssistantID = watch('openai_assistant_id')
    const selectedModel = watch('model')
    const codeInterpreter = watch('enable_code_interpreter')
    const fileSearch = watch('enable_file_search')

    // Load the OpenAI models when the bot is enabled
    useEffect(() => {
        if (isAiBot) {
            fetchOpenAIModels()
        }
    }, [isAiBot])

    // Check tools availability when the model changes
    useEffect(() => {
        if (isAiBot && selectedModel) {
            checkModelTools(selectedModel)
        }
    }, [selectedModel, isAiBot])

    const fetchOpenAIModels = async () => {
        try {
            setIsLoadingModels(true)
            const response = await axios.get('/api/method/raven.api.ai_features.get_openai_available_models')
            if (response.data && response.data.message) {
                setModels(response.data.message)
            }
        } catch (error) {
            console.error('Error fetching OpenAI models:', error)
            setModels([])
        } finally {
            setIsLoadingModels(false)
        }
    }

    const checkModelTools = async (modelId: string) => {
        try {
            setIsLoadingToolsInfo(true)
            const response = await axios.get('/api/method/raven.api.ai_features.get_model_supported_tools', {
                params: { model_id: modelId }
            })
            
            if (response.data && response.data.message) {
                const info = response.data.message as ModelToolsInfo
                setToolsInfo(info)
                
                // Disable incompatible tools automatically
                if (codeInterpreter && !info.supports_code_interpreter) {
                    setValue('enable_code_interpreter', 0)
                }
                
                if (fileSearch && !info.supports_file_search) {
                    setValue('enable_file_search', 0)
                }
            }
        } catch (error) {
            console.error('Error checking tool compatibility:', error)
            
            // Extract a specific error message if possible
            let errorMessage = "Unknown error"
            
            if (error instanceof Error) {
                errorMessage = error.message
            }
            
            // If the error is of type Axios with a response
            if (axios.isAxiosError(error) && error.response?.data) {
                // For Frappe errors that contain exception information
                if (error.response.data.exception) {
                    // Extract some useful information from the exception
                    const exceptionString = error.response.data.exception
                    
                    if (exceptionString.includes("CharacterLengthExceeded")) {
                        errorMessage = "Error message too long"
                    } else if (exceptionString.includes("400")) {
                        errorMessage = "Tool not supported by this model"
                    } else if (exceptionString.includes("417")) {
                        errorMessage = "Incompatible model/tool combination"
                    } else if (exceptionString.includes("file_search")) {
                        errorMessage = "File Search not supported by this model"
                    } else if (exceptionString.includes("code_interpreter")) {
                        errorMessage = "Code Interpreter not supported by this model"
                    }
                }
            }
            
            // Create an information object with the error
            const fallbackToolsInfo: ModelToolsInfo = {
                model: modelId,
                supported_tools: [],
                supports_code_interpreter: false,
                supports_file_search: false,
                error: errorMessage
            }
            
            setToolsInfo(fallbackToolsInfo)
            
            // Disable tools automatically if we can't check their compatibility
            if (codeInterpreter) {
                setValue('enable_code_interpreter', 0)
            }
            
            if (fileSearch) {
                setValue('enable_file_search', 0)
            }
        } finally {
            setIsLoadingToolsInfo(false)
        }
    }

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
            <Stack maxWidth={'480px'}>
                <Label htmlFor='model'>OpenAI Model</Label>
                <Controller
                    control={control}
                    name='model'
                    defaultValue='gpt-4o-mini'
                    render={({ field }) => (
                        <Select.Root
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!isAiBot || isLoadingModels}
                        >
                            <Select.Trigger id="model">
                                {isLoadingModels ? (
                                    <ImSpinner8 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" />
                                ) : (
                                    <>{field.value}</>
                                )}
                            </Select.Trigger>
                            <Select.Content>
                                {models.map((model) => (
                                    <Select.Item key={model.id} value={model.id}>
                                        {model.id}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText>
                    Select the model you want to use for the bot.
                </HelperText>
            </Stack>

            {toolsInfo && (
                <Callout.Root color={toolsInfo.error ? "red" : "blue"} size="1">
                    <Callout.Icon>
                        {toolsInfo.error ? <FiAlertTriangle /> : <BiInfoCircle />}
                    </Callout.Icon>
                    <Callout.Text>
                        {toolsInfo.error ? (
                            <>
                                Model <strong>{toolsInfo.model}</strong> compatibility check failed: {toolsInfo.error}
                            </>
                        ) : (
                            <>
                                Model <strong>{toolsInfo.model}</strong> supports: {toolsInfo.supported_tools.length > 0 
                                    ? toolsInfo.supported_tools.map(tool => {
                                        if (tool === "code_interpreter") return "Code Interpreter";
                                        if (tool === "file_search") return "File Search";
                                        return tool;
                                    }).join(', ') 
                                    : "no additional tools"}
                            </>
                        )}
                    </Callout.Text>
                </Callout.Root>
            )}

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
            <Stack maxWidth={'560px'}>
                <Text as="label" size="2">
                    <HStack align='center'>
                        <Controller
                            control={control}
                            name='enable_file_search'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    disabled={toolsInfo && !toolsInfo.supports_file_search}
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
                {toolsInfo && !toolsInfo.supports_file_search && (
                    <Text size="1" color="orange">
                        The selected model does not support File Search.
                    </Text>
                )}
                <HelperText>
                    Enable this if you want the bot to be able to read PDF files and scan them.
                    <br /><br />
                    File search enables the assistant with knowledge from files that you upload.
                    <br /><br />
                    Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.
                </HelperText>
            </Stack>
            <Separator className='w-full' />
            <Stack maxWidth={'560px'}>
                <Text as="label" size="2">
                    <HStack align='center'>
                        <Controller
                            control={control}
                            name='enable_code_interpreter'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                    disabled={toolsInfo && !toolsInfo.supports_code_interpreter}
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
                {toolsInfo && !toolsInfo.supports_code_interpreter && (
                    <Text size="1" color="orange">
                        The selected model does not support Code Interpreter.
                    </Text>
                )}
                <HelperText>
                    Enable this if you want the bot to be able to process files like Excel sheets or data from Insights.
                    <br />
                    OpenAI Assistants run code in a sandboxed environment (on OpenAI servers) to do this.
                </HelperText>
            </Stack>
            <Separator className='w-full' />
            <Heading as='h5' size='2' className='not-cal' weight='medium'>Advanced</Heading>
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

        </Stack>
    )
}

export default AIFeaturesBotForm