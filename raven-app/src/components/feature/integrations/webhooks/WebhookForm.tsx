import React, { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Webhook } from '@/types/Integrations/Webhook'
import { Box, Checkbox, Flex, TextFieldInput, Select, TextArea, Heading, Text } from '@radix-ui/themes';
import { ErrorText, HelperText, Label } from '@/components/common/Form';
import { WebhookData } from './WebhookReturnDataFieldTable';
import { WebhookHeaders } from './WebhookHeaders';
import { TriggerEvents } from './utils';

export interface WebhookFormField extends Webhook {
    need_condition: boolean
}

export const WebhookForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const { register, formState: { errors }, control, setValue, watch } = useFormContext<WebhookFormField>()

    const onTriggerEventChange = (value: string) => {
        if (value) {
            setValue('webhook_data', [])
            const field = TriggerEvents?.find(event => event.key === value)
            if (field) {
                setValue('webhook_doctype', field.doctype)
                setValue('webhook_docevent', field.event)
            }
        }
    }

    const webhookDoctype = watch('webhook_doctype')

    const webhookDocevent = watch('webhook_docevent')

    const security = watch('enable_security')

    const needCondition = watch('need_condition')

    const triggerValue = useMemo(() => {
        if (webhookDoctype && webhookDocevent) {
            const field = TriggerEvents?.find(event => event.doctype === webhookDoctype && event.event === webhookDocevent)
            return field?.key
        }
        return ''
    }, [webhookDoctype, webhookDocevent])

    return (
        <Flex direction='column' gap='4' >
            {isEdit === false ? <Box>
                <Label htmlFor='name' isRequired>Name</Label>
                <TextFieldInput {...register('name', {
                    required: 'Name is required', maxLength: {
                        value: 140,
                        message: "Name should not exceed 140 characters"
                    }

                })} />
                {errors?.name && <ErrorText>{errors.name.message}</ErrorText>}
            </Box> : null}
            <Box>
                <Label htmlFor='request_url' isRequired>Request URL</Label>
                <TextFieldInput {...register('request_url', {
                    required: 'Request URL is required',
                    maxLength: {
                        value: 140,
                        message: "Request URL should not exceed 140 characters"
                    }
                })} />
                {errors?.request_url && <ErrorText>{errors.request_url.message}</ErrorText>}
            </Box>
            <Box>
                <Label htmlFor='timeout' >Request Timeout</Label>
                <TextFieldInput type='number' {...register('timeout', {
                    valueAsNumber: true,
                })} />
                <HelperText>The number of seconds until the request expires</HelperText>
                {errors?.timeout && <ErrorText>{errors.timeout.message}</ErrorText>}
            </Box>
            <Box>
                <Controller
                    control={control}
                    name='enable_security'
                    render={({ field }) => (
                        <Flex direction={'row'} gap={'2'} align={'center'}>
                            <Checkbox checked={field.value ? true : false} onClick={() => field.onChange(!field.value)} />
                            <Label htmlFor='enable_security' >
                                Enable Security
                            </Label>
                        </Flex>
                    )}
                />

                {errors?.enable_security && <ErrorText>{errors.enable_security.message}</ErrorText>}
            </Box>
            {security ? <Box>
                <Label htmlFor='webhook_secret' >Webhook Secret</Label>
                <TextFieldInput type='password' {...register('webhook_secret', {
                    maxLength: {
                        value: 140,
                        message: "Webhook Secret should not exceed 140 characters"
                    }
                })} />
                {errors?.webhook_secret && <ErrorText>{errors.webhook_secret.message}</ErrorText>}
            </Box> : null}
            <Box>
                <Flex direction='column' gap='2'>
                    <Label isRequired>Trigger Event</Label>
                    <Select.Root value={triggerValue} onValueChange={onTriggerEventChange} required disabled={isEdit}>
                        <Select.Trigger placeholder='Trigger Events' />
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>Trigger Events</Select.Label>
                                {
                                    TriggerEvents?.map((event, index) => (
                                        <Select.Item key={index} value={event.key}>{event.label}</Select.Item>
                                    ))
                                }
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Flex>
            </Box>
            <Box>
                <Controller
                    control={control}
                    name='need_condition'
                    render={({ field }) => (
                        <Flex direction={'row'} gap={'2'} align={'center'}>
                            <Checkbox checked={field.value ? true : false} onClick={() => field.onChange(!field.value)} />
                            <Label htmlFor='need_condition' >
                                Trigger this webhook based on a condition
                            </Label>
                        </Flex>
                    )}
                />

                {errors?.enable_security && <ErrorText>{errors.enable_security.message}</ErrorText>}
            </Box>
            {needCondition && <Box>
                <Flex direction={'row'} gap={'8'} align={'start'}>
                    <Flex direction={'column'} gap={'2'} style={{
                        width: '60%'
                    }} >
                        <Label htmlFor='condition'>Condition</Label>
                        <TextArea {...register('condition')} rows={4} />
                        <HelperText>The webhook will be triggered if this expression is true</HelperText>
                    </Flex>
                    <Flex direction='column' gap='2' align={'start'}>
                        <Heading as='h3' size='2'>Condition Examples :</Heading>
                        <Flex direction='column' gap='1' align={'start'}>
                            <Text size='2'><span>doc.channel_id == 'general'</span></Text>
                            <Text size='2'><span>doc.is_direct_message == 1</span></Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Box>}
            <WebhookData />
            <WebhookHeaders />
        </Flex>
    )
}