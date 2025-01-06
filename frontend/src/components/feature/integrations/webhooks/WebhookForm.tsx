import { useContext, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, Checkbox, Flex, TextField, Select, TextArea, Text, Code, Badge, Tabs, } from '@radix-ui/themes';
import { ErrorText, HelperText, Label } from '@/components/common/Form';
import { WebhookData } from './WebhookReturnDataFieldTable';
import { WebhookHeaders } from './WebhookHeaders';
import { TriggerEvents } from './utils';
import { RavenWebhook } from '@/types/RavenIntegrations/RavenWebhook';
import { UserFields, UserListContext } from '@/utils/users/UserListProvider';
import { ChannelListContext, ChannelListContextType, ChannelListItem, } from '@/utils/channel/ChannelListProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { SidebarIcon } from '@/components/layout/Sidebar/SidebarComp';
import { useGetUser } from '@/hooks/useGetUser';
import { ChannelIcon } from '@/utils/layout/channelIcon';
import { HStack, Stack } from '@/components/layout/Stack';
import { AiOutlineApi, AiOutlineDatabase } from 'react-icons/ai';
import { BiBuildings, BiCodeCurly } from 'react-icons/bi';
import { LuWorkflow } from 'react-icons/lu';

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}

export const WebhookForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const { register, formState: { errors }, control, setValue, watch } = useFormContext<RavenWebhook>()



    return (
        <Tabs.Root defaultValue='general'>
            <Tabs.List>
                <Tabs.Trigger value='general'><AiOutlineApi {...ICON_PROPS} /> General</Tabs.Trigger>
                <Tabs.Trigger value='condition'><LuWorkflow {...ICON_PROPS} /> Conditions</Tabs.Trigger>
                <Tabs.Trigger value='data'><AiOutlineDatabase {...ICON_PROPS} /> Data</Tabs.Trigger>
                <Tabs.Trigger value='headers'><BiCodeCurly {...ICON_PROPS} /> Headers</Tabs.Trigger>
            </Tabs.List>
            <Box pt='4'>
                <Tabs.Content value='general'>
                    <GeneralWebhookForm isEdit={isEdit} />
                </Tabs.Content>
                <Tabs.Content value='condition'>
                    <ConditionWebhookForm />
                </Tabs.Content>
                <Tabs.Content value='data'>
                    <WebhookData />
                </Tabs.Content>
                <Tabs.Content value='headers'>
                    <WebhookHeaders />
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    )
}

const GeneralWebhookForm = ({ isEdit = false }: { isEdit?: boolean }) => {

    const { register, formState: { errors }, control, setValue, watch } = useFormContext<RavenWebhook>()

    const security = watch('enable_security')

    return <Stack gap='4'>
        {isEdit === false ? <Stack>
            <Box>
                <Label htmlFor='name' isRequired>Name</Label>
                <TextField.Root
                    id='name'
                    autoFocus
                    {...register('name', {
                        required: 'Name is required',
                        maxLength: {
                            value: 140,
                            message: "Name should not exceed 140 characters"
                        }

                    })} />
            </Box>
            {errors?.name && <ErrorText>{errors.name.message}</ErrorText>}
        </Stack> : null}

        <Stack>
            <Box>
                <Label htmlFor='request_url' isRequired>Request URL</Label>
                <TextField.Root {...register('request_url', {
                    required: 'Request URL is required',
                    maxLength: {
                        value: 140,
                        message: "Request URL should not exceed 140 characters"
                    }
                })}
                    id='request_url'
                />
            </Box>
            {errors?.request_url && <ErrorText>{errors.request_url.message}</ErrorText>}
        </Stack>

        <Stack>
            <Box maxWidth={'360px'}>
                <Label htmlFor='timeout'>Request Timeout</Label>
                <TextField.Root type='number' {...register('timeout', {
                    valueAsNumber: true,
                })} />
                <HelperText>The number of seconds until the request expires.</HelperText>
            </Box>
            {errors?.timeout && <ErrorText>{errors.timeout.message}</ErrorText>}
        </Stack>

        <Stack maxWidth={'360px'}>
            <Box>
                <Flex direction={'column'}>

                    <Label isRequired htmlFor='webhook_trigger'>Trigger Event</Label>
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
                                <Select.Trigger id='webhook_trigger' placeholder='Trigger Events' />
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
            {errors?.webhook_trigger && <ErrorText>{errors.webhook_trigger.message}</ErrorText>}
        </Stack>

        <Stack pt='2'>
            <Text as="label" size="2">
                <Flex gap="2">
                    <Controller
                        control={control}
                        name='enable_security'
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value ? true : false}
                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                            />
                        )} />

                    Enable Security? <Badge color='gray'>Recommended</Badge>
                </Flex>
            </Text>
            <HelperText size='2'>
                To optionally add security to your webhook requests and ensure that the webhook is being sent from Raven, you can set up a "Webhook Secret" along with the request. Do not share the secret publicly.
                <br /><br />
                If enabled, an additional header (X-Frappe-Webhook-Signature) will be added to the request before it's sent out, with its value being generated from the secret as a base64-encoded HMAC-SHA256 hash of the payload.
            </HelperText>
            {errors?.enable_security && <ErrorText>{errors.enable_security.message}</ErrorText>}
        </Stack>
        {security ? <Box>
            <Label htmlFor='webhook_secret' isRequired>Webhook Secret</Label>
            <TextField.Root type='password' {...register('webhook_secret', {
                required: security ? 'Webhook secret is required' : false,
                maxLength: {
                    value: 140,
                    message: "Webhook secret should not exceed 140 characters"
                }
            })} />
            {errors?.webhook_secret && <ErrorText>{errors.webhook_secret.message}</ErrorText>}
        </Box> : null}

    </Stack>
}

const ConditionWebhookForm = () => {
    const { watch, formState: { errors }, control, setValue, register } = useFormContext<RavenWebhook>()

    const needCondition = watch('trigger_webhook_on_condition')

    const conditionOn = watch('conditions_on')

    const { users } = useContext(UserListContext)

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const webhookTrigger = watch('webhook_trigger')

    const triggerOn = useMemo(() => {
        if (webhookTrigger) {
            return TriggerEvents?.find((event) => event.label === webhookTrigger)?.trigger_on
        }
        return []
    }, [webhookTrigger])

    return <Stack gap='4'>
        <Stack>
            <Text as="label" size="2">
                <Flex gap="2">
                    <Controller
                        control={control}
                        name='trigger_webhook_on_condition'
                        rules={{
                            onChange: (e) => {
                                if (!e.target.value) {
                                    setValue('conditions_on', '')
                                    setValue('condition', '')
                                    setValue('channel_id', '')
                                    setValue('user', '')
                                    setValue('channel_type', '')
                                }
                            }
                        }}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value ? true : false}
                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                            />
                        )} />

                    Trigger this webhook based on a condition
                </Flex>
            </Text>
            {errors?.trigger_webhook_on_condition && <ErrorText>{errors.trigger_webhook_on_condition.message}</ErrorText>}
        </Stack>

        {needCondition ?
            <Flex direction={'column'}>
                <Label htmlFor='condition'>Trigger On</Label>
                <Controller
                    control={control}
                    name='conditions_on'
                    rules={{
                        required: 'Field is required',
                        onChange: (e) => {
                            if (e.target.value) {
                                setValue('condition', '')
                                setValue('channel_id', '')
                                setValue('user', '')
                                setValue('channel_type', '')
                            }
                        }
                    }}
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} required>
                            <Select.Trigger placeholder='Select Field' />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Trigger On</Select.Label>
                                    {triggerOn?.map((event, index) => (
                                        <Select.Item key={index} value={event}>{event}</Select.Item>
                                    ))}
                                    <Select.Item value='Custom'>Custom</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText style={{
                    paddingTop: '0.25rem'
                }}>Field on which the condition will be applied</HelperText>
            </Flex> : null}
        {conditionOn === 'Custom' ? <Box>
            <Flex direction={'row'} gap={'4'} align={'start'}>
                <Flex direction={'column'} style={{
                    width: '60%'
                }} >
                    <Label htmlFor='condition' isRequired>Condition</Label>
                    <TextArea
                        id='condition'
                        {...register('condition', {
                            required: conditionOn === 'Custom' ? 'Condition is required' : false,
                        })}
                        rows={10}
                    />
                    {errors?.condition && <ErrorText className='pt-1'>{errors.condition.message}</ErrorText>}
                    <HelperText style={{
                        paddingTop: '0.25rem'
                    }}>The webhook will be triggered if this expression is true.</HelperText>
                </Flex>
                <Code color='gray' size='2' className='mt-7 p-4'>
                    <Text weight='bold' size='2' className='block'>Try something like:</Text>
                    doc.channel_id == 'general'<br />
                    doc.is_direct_message == 1 <br />
                    doc.owner == 'Administrator'
                </Code>
            </Flex>
        </Box> : conditionOn === 'Channel' ? <Box>
            <Flex direction={'column'}>
                <Label htmlFor='channel_id'>Channel</Label>
                <Controller
                    control={control}
                    name='channel_id'
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} required>
                            <Select.Trigger placeholder='Select Field' />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Channel</Select.Label>
                                    {
                                        channels.map((channel, index) => (
                                            <Select.Item key={index} value={channel.name}>
                                                <ChannelItem channel={channel} />
                                            </Select.Item>
                                        ))
                                    }
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText style={{
                    paddingTop: '0.25rem'
                }}>Webhook will trigger only if the message is sent on this channel.</HelperText>
            </Flex>
        </Box> : conditionOn === 'User' ? <Flex direction={'column'}>
            <Label htmlFor='user_id'>User</Label>
            <Controller
                control={control}
                name='user'
                render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} required>
                        <Select.Trigger placeholder='Select Field' />
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>User</Select.Label>
                                {
                                    users.map((user, index) => (
                                        <Select.Item key={index} value={user.name}>
                                            <DirectMessageItem user={user} />
                                        </Select.Item>
                                    ))
                                }
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                )}
            />
            <HelperText style={{
                paddingTop: '0.25rem'
            }}>Webhook will trigger only if the message is sent by this user.</HelperText>
        </Flex> : conditionOn === 'Channel Type' ? <Flex direction={'column'}>
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
            <HelperText style={{
                paddingTop: '0.25rem'
            }}>The webhook will trigger if the channel type is equal to the value selected here.</HelperText>
        </Flex> : null
        }
    </Stack>
}

export const DirectMessageItem = ({ user }: { user: UserFields }) => {

    return <Flex direction={'row'} gap={'2'} align={'center'}>
        <SidebarIcon>
            <UserAvatar src={user?.user_image} alt={user?.full_name} size='1' />
        </SidebarIcon>
        <Flex justify='between'>
            <Text size='2' className="text-ellipsis line-clamp-1" >
                {user?.full_name ?? user?.name}
            </Text>
        </Flex>
    </Flex>
}

export const ChannelItem = ({ channel }: { channel: ChannelListItem }) => {
    return <HStack justify='between' width='100%'>
        <Flex direction={'row'} gap={'1'} align={'center'}>
            <ChannelIcon type={channel.type} size='18' />
            <Flex justify='between' align={'center'} width='100%'>
                <Text size='2' className="text-ellipsis line-clamp-1" as='span' >{channel.channel_name}</Text>
            </Flex>
        </Flex>
        <HStack gap='1' align='center'>
            <BiBuildings className='opacity-75' />
            <Text size='1' className='opacity-75'>{channel.workspace}</Text>
        </HStack>
    </HStack>
}
