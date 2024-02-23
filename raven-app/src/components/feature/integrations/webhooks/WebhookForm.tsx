import React, { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, Checkbox, Flex, TextFieldInput, Select, TextArea, Heading, Text } from '@radix-ui/themes';
import { ErrorText, HelperText, Label } from '@/components/common/Form';
import { WebhookData } from './WebhookReturnDataFieldTable';
import { WebhookHeaders } from './WebhookHeaders';
import { TriggerEvents } from './utils';
import { RavenWebhook } from '@/types/RavenIntegrations/RavenWebhook';
import { UserListContext } from '@/utils/users/UserListProvider';
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider';

export const WebhookForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const { register, formState: { errors }, control, setValue, watch } = useFormContext<RavenWebhook>()

    const security = watch('enable_security')

    const needCondition = watch('trigger_webhook_on_condition')

    const conditionOn = watch('conditions_on')

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
                    <Controller
                        control={control}
                        name='webhook_trigger'
                        rules={{
                            onChange: (e) => {
                                if (e.target.value) {
                                    setValue('webhook_data', [])

                                }
                            }
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange} required disabled={isEdit}>
                                <Select.Trigger placeholder='Trigger Events' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Trigger Events</Select.Label>
                                        {
                                            TriggerEvents?.map((event, index) => (
                                                <Select.Item key={index} value={event.label}>{event.label}</Select.Item>
                                            ))
                                        }
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Flex>
            </Box>
            <Box>
                <Controller
                    control={control}
                    name='trigger_webhook_on_condition'
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
                <Flex direction={'column'} gap={'2'}>
                    <Label htmlFor='condition'>Condition On</Label>
                    <Controller
                        control={control}
                        name='conditions_on'
                        render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange} required>
                                <Select.Trigger placeholder='Select Field' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Condition On</Select.Label>
                                        <Select.Item value='Channel'>Channel</Select.Item>
                                        <Select.Item value='User'>User</Select.Item>
                                        <Select.Item value='Channel Type' >Channel Type</Select.Item>
                                        <Select.Item value='Custom'>Custom</Select.Item>
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                    <HelperText>Field on which the condition will be applied</HelperText>
                </Flex>
            </Box>}
            {conditionOn === 'Custom' ? <Box>
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
            </Box> : conditionOn === 'Channel' ? <Box>
                <Label htmlFor='channel_id'>Channel ID</Label>
                <TextFieldInput {...register('channel_id')} />
                <HelperText>Channel ID on which the condition will be applied</HelperText>
            </Box> : conditionOn === 'User' ? <Box>
                <Label htmlFor='user_id'>User ID</Label>
                <TextFieldInput {...register('user')} />
                <HelperText>User ID on which the condition will be applied</HelperText>
            </Box> : conditionOn === 'Channel Type' ? <Box>
                <Label htmlFor='channel_type'>Channel Type</Label>
                <Controller
                    control={control}
                    name='channel_type'
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} required>
                            <Select.Trigger placeholder='Select Field' />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Channel Type</Select.Label>
                                    <Select.Item value='Public'>Public</Select.Item>
                                    <Select.Item value='Private'>Private</Select.Item>
                                    <Select.Item value='Open'>Open</Select.Item>
                                    <Select.Item value='DM'>Direct Message</Select.Item>
                                    <Select.Item value='Self Message'>Self Message</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText>Channel Type on which the condition will be applied</HelperText>
            </Box> : null}
            <WebhookData />
            <WebhookHeaders />
        </Flex>
    )
}