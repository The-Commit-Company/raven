import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { RavenSettings } from '@/types/Raven/RavenSettings'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Box, Button, Checkbox, Flex, Separator, Text, TextField, Select, Tabs, Callout } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { BiInfoCircle, BiCheckCircle, BiXCircle } from 'react-icons/bi'
import { Stack } from '@/components/layout/Stack'

const AISettings = () => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { ravenSettings, mutate } = useRavenSettings()

    const methods = useForm<RavenSettings>({
        disabled: !isRavenAdmin
    })

    const { handleSubmit, control, watch, reset } = methods

    useEffect(() => {
        if (ravenSettings) {
            reset(ravenSettings)
        }
    }, [ravenSettings])

    const { updateDoc, loading: updatingDoc } = useFrappeUpdateDoc<RavenSettings>()

    const onSubmit = (data: RavenSettings) => {
        toast.promise(updateDoc('Raven Settings', null, {
            ...(ravenSettings ?? {}),
            ...data
        }).then(res => {
            mutate(res, {
                revalidate: false
            })
        }), {
            loading: 'Updating...',
            success: () => {
                return `Settings updated`;
            },
            error: 'There was an error.',
        })

    }

    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                methods.handleSubmit(onSubmit)()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const isAIEnabled = watch('enable_ai_integration')



    return (
        <PageContainer>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title='AI Settings'
                            description='Configure AI providers to use AI features in Raven.'
                            actions={<Button type='submit' disabled={updatingDoc || !isRavenAdmin}>
                                {updatingDoc && <Loader className="text-white" />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>}
                        />

                        <Flex direction={'column'} gap='2'>
                            <Text as="label" size="2">
                                <Flex gap="2">
                                    <Controller
                                        control={control}
                                        defaultValue={ravenSettings?.enable_ai_integration}
                                        name='enable_ai_integration'
                                        render={({ field }) => (
                                            <Checkbox
                                                checked={field.value ? true : false}
                                                name={field.name}
                                                disabled={field.disabled}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )} />

                                    Enable AI Integration
                                </Flex>
                            </Text>
                        </Flex>
                        <Separator size='4' />

                        {isAIEnabled ? (
                            <Tabs.Root defaultValue="openai">
                                <Tabs.List>
                                    <Tabs.Trigger value="openai">OpenAI</Tabs.Trigger>
                                    <Tabs.Trigger value="local">Local LLM</Tabs.Trigger>
                                </Tabs.List>

                                <Box mt="4">
                                    <Tabs.Content value="openai">
                                        <OpenAISection />
                                    </Tabs.Content>

                                    <Tabs.Content value="local">
                                        <LocalLLMSection />
                                    </Tabs.Content>
                                </Box>
                            </Tabs.Root>
                        ) : null}
                    </SettingsContentContainer>
                </form>
            </FormProvider>
        </PageContainer>
    )
}
const OpenAISection = () => {

    const { data: openaiVersion } = useFrappeGetCall<{ message: string }>('raven.api.ai_features.get_open_ai_version')

    const { watch, control, register, formState: { errors } } = useFormContext<RavenSettings>()

    const enableOpenAI = watch('enable_openai_services')

    return (
        <Flex direction="column" gap="4">
            <Flex direction={'column'} gap='2'>
                <Text as="label" size="2">
                    <Flex gap="2">
                        <Controller
                            control={control}
                            name='enable_openai_services'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    name={field.name}
                                    disabled={field.disabled}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />
                        Enable OpenAI Services
                    </Flex>
                </Text>
            </Flex>

            {enableOpenAI ? (
                <>
                    <Box>
                        <Label htmlFor='openai_organisation_id' isRequired>OpenAI Organization ID</Label>
                        <TextField.Root
                            maxLength={140}
                            className={'w-48 sm:w-96'}
                            id='openai_organisation_id'
                            autoComplete='off'
                            required
                            placeholder='org-************************'
                            {...register('openai_organisation_id', {
                                required: enableOpenAI ? "Please add your OpenAI Organization ID" : false,
                                maxLength: {
                                    value: 140,
                                    message: "ID cannot be more than 140 characters."
                                }
                            })}
                            aria-invalid={errors.openai_organisation_id ? 'true' : 'false'}
                        />
                        {errors?.openai_organisation_id && <ErrorText>{errors.openai_organisation_id?.message}</ErrorText>}
                    </Box>

                    <Box>
                        <Label htmlFor='openai_api_key' isRequired>OpenAI API Key</Label>
                        <TextField.Root
                            className={'w-48 sm:w-96'}
                            id='openai_api_key'
                            required
                            type='password'
                            autoComplete='off'
                            placeholder='••••••••••••••••••••••••••••••••'
                            {...register('openai_api_key', {
                                required: enableOpenAI ? "Please add your OpenAI API Key" : false,
                            })}
                            aria-invalid={errors.openai_api_key ? 'true' : 'false'}
                        />
                        {errors?.openai_api_key && <ErrorText>{errors.openai_api_key?.message}</ErrorText>}
                    </Box>

                    <Box>
                        <Label htmlFor='openai_project_id'>OpenAI Project ID</Label>
                        <TextField.Root
                            maxLength={140}
                            className={'w-48 sm:w-96'}
                            id='openai_project_id'
                            autoComplete='off'
                            placeholder='proj_************************'
                            {...register('openai_project_id', {
                                maxLength: {
                                    value: 140,
                                    message: "ID cannot be more than 140 characters."
                                }
                            })}
                            aria-invalid={errors.openai_project_id ? 'true' : 'false'}
                        />
                        {errors?.openai_project_id && <ErrorText>{errors.openai_project_id?.message}</ErrorText>}
                        <HelperText>
                            If not set, the integration will use the default project.
                        </HelperText>
                    </Box>
                </>
            ) : null}

            {openaiVersion && <Text color='gray' size='2'>OpenAI Python SDK Version: {openaiVersion.message}</Text>}
        </Flex>
    )
}

const LocalLLMSection = () => {

    const { watch, control, register, formState: { errors } } = useFormContext<RavenSettings>()

    const enableLocalLLM = watch('enable_local_llm')
    const localLLMProvider = watch('local_llm_provider')
    const localLLMUrl = watch('local_llm_api_url')

    const { call: testConnection, loading: testing } = useFrappePostCall<{
        message: {
            success: boolean
            message: string
            models?: Array<{ id: string }>
        }
    }>('raven.api.ai_features.test_llm_configuration')

    const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null)

    const handleTestConnection = async () => {
        if (!localLLMUrl) {
            toast.error('Please enter an API URL')
            return
        }

        try {
            const result = await testConnection({
                provider: 'Local LLM',
                api_url: localLLMUrl
            })

            setTestResult({
                success: result.message.success,
                message: result.message.message
            })

            if (result.message.success) {
                toast.success('Connection successful!')
            } else {
                toast.error(result.message.message)
            }
        } catch (error) {
            toast.error('Failed to test connection')
            setTestResult({
                success: false,
                message: 'Failed to test connection'
            })
        }
    }

    return (
        <Flex direction="column" gap="4">
            <Flex direction={'column'} gap='2'>
                <Text as="label" size="2">
                    <Flex gap="2">
                        <Controller
                            control={control}
                            name='enable_local_llm'
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value ? true : false}
                                    name={field.name}
                                    disabled={field.disabled}
                                    onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                />
                            )} />
                        Enable Local LLM
                    </Flex>
                </Text>
            </Flex>

            {enableLocalLLM ? (
                <>
                    <Stack gap='1'>
                        <Label htmlFor='local_llm_provider'>Local LLM Provider</Label>
                        <Controller
                            control={control}
                            name='local_llm_provider'
                            render={({ field }) => (
                                <Select.Root
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <Select.Trigger placeholder="Select Provider" className='w-48 sm:w-96' />
                                    <Select.Content>
                                        <Select.Item value="LM Studio">LM Studio</Select.Item>
                                        <Select.Item value="Ollama">Ollama</Select.Item>
                                        <Select.Item value="LocalAI">LocalAI</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            )}
                        />
                        <HelperText>
                            Select your local LLM provider
                        </HelperText>
                    </Stack>

                    <Box>
                        <Label htmlFor='local_llm_api_url' isRequired>Local LLM API URL</Label>
                        <Flex gap="2" align="end">
                            <TextField.Root
                                className={'w-48 sm:w-96'}
                                id='local_llm_api_url'
                                required={enableLocalLLM === 1}
                                autoComplete='off'
                                placeholder='http://localhost:11434/v1'
                                {...register('local_llm_api_url', {
                                    required: enableLocalLLM ? "Please add your Local LLM API URL" : false,
                                })}
                                aria-invalid={errors.local_llm_api_url ? 'true' : 'false'}
                            />
                            <Button
                                type="button"
                                variant="soft"
                                className='not-cal'
                                onClick={handleTestConnection}
                                disabled={testing || !localLLMUrl}
                            >
                                {testing && <Loader className="text-gray-900" />}
                                Test Connection
                            </Button>
                        </Flex>
                        {errors?.local_llm_api_url && <ErrorText>{errors.local_llm_api_url?.message}</ErrorText>}
                        <HelperText>
                            Enter the API endpoint URL for your local LLM service
                        </HelperText>
                    </Box>

                    {testResult && (
                        <Callout.Root color={testResult.success ? "green" : "red"} size="1">
                            <Callout.Icon>
                                {testResult.success ? <BiCheckCircle /> : <BiXCircle />}
                            </Callout.Icon>
                            <Callout.Text>
                                {testResult.message}
                            </Callout.Text>
                        </Callout.Root>
                    )}

                    <Callout.Root size="1">
                        <Callout.Icon>
                            <BiInfoCircle />
                        </Callout.Icon>
                        <Callout.Text>
                            {localLLMProvider === 'LM Studio' && 'Make sure LM Studio is running with the server enabled on the specified URL.'}
                            {localLLMProvider === 'Ollama' && 'Make sure Ollama is running. Default URL is usually http://localhost:11434/v1'}
                            {localLLMProvider === 'LocalAI' && 'Make sure LocalAI is running on the specified URL.'}
                            {!localLLMProvider && 'Select a provider to see specific instructions.'}
                        </Callout.Text>
                    </Callout.Root>
                </>
            ) : null}
        </Flex>
    )
}

export const Component = AISettings