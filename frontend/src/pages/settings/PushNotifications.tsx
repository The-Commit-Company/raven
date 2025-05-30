import { CustomCallout } from '@/components/common/Callouts/CustomCallout'
import { HelperText } from '@/components/common/Form'
import { ErrorText } from '@/components/common/Form'
import { Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner, getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { Stack } from '@/components/layout/Stack'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { RavenSettings } from '@/types/Raven/RavenSettings'
import { isSystemManager } from '@/utils/roles'
import { __ } from '@/utils/translations'
import { Box, Button, Link, Select, Strong, Text, TextField } from '@radix-ui/themes'
import { FrappeConfig, FrappeContext, useFrappePostCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useContext, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi'
import { toast } from 'sonner'

const PushNotifications = () => {

    const isRavenAdmin = isSystemManager()

    const { ravenSettings, mutate, error } = useRavenSettings()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const methods = useForm<RavenSettings>({
        disabled: !isRavenAdmin
    })

    const { handleSubmit, control, watch, reset, register, formState: { errors }, setValue } = methods

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

    const isRavenCloud = watch('push_notification_service') === "Raven"

    return (
        <PageContainer>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title={__('Push Notifications')}
                            description={__("Configure the push notification service here.")}
                            actions={<Button type='submit' disabled={updatingDoc || !isRavenAdmin}>
                                {updatingDoc && <Loader className="text-white" />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>}
                        />
                        {!isRavenAdmin && <CustomCallout
                            iconChildren={<FiAlertTriangle />}
                            rootProps={{ color: 'blue', variant: 'surface' }}
                            textChildren={__("You need to be a System Manager to manage the push notification service.")} >
                        </CustomCallout>}
                        <ErrorBanner error={error} />

                        <Text size='2'>To send push notifications, you have two options:
                            <br />
                            <br />
                            <ol className='list-decimal list-inside'>
                                <li>
                                    <Strong>Raven Cloud</Strong> - this is recommended. If you are self hosting, this is the only option.
                                </li>
                                <li>
                                    <Strong>Frappe Cloud</Strong> - if you are using Frappe Cloud, you can use this option.
                                </li>
                            </ol>
                        </Text>

                        <Box className='max-w-96'>
                            <Label isRequired htmlFor='push_notification_service'>{__("Push Notification Service")}</Label>
                            <Controller
                                control={control}
                                defaultValue={ravenSettings?.push_notification_service}
                                name='push_notification_service'
                                rules={{
                                    required: "Please select a push notification service",
                                    onChange: (e) => {
                                        setValue('push_notification_server_url', 'https://cloud.ravenchat.ai')
                                    }
                                }}
                                render={({ field }) => (
                                    <Select.Root
                                        value={field.value}
                                        disabled={field.disabled}
                                        name={field.name}
                                        onValueChange={field.onChange}>
                                        <Select.Trigger className='w-full' />
                                        <Select.Content>
                                            <Select.Item value='Raven'>
                                                {__("Raven Cloud")}
                                            </Select.Item>
                                            <Select.Item value='Frappe Cloud'>
                                                {__("Frappe Cloud")}
                                            </Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                )}
                            />
                            <HelperText>We recommend using Raven Cloud for push notifications.</HelperText>
                        </Box>

                        {isRavenCloud ?
                            <Stack gap='3'>
                                <Text size='2'>
                                    To get started with Raven Cloud, you need to first <Link href="https://cloud.ravenchat.ai" target='_blank'>create an account <FiExternalLink /></Link> and get your API Key and API Secret.
                                </Text>
                                <Box>
                                    <Label htmlFor='push_notification_server_url' isRequired>Push Notification Server URL</Label>
                                    <TextField.Root
                                        autoFocus
                                        maxLength={140}
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_server_url'
                                        autoComplete='off'
                                        required
                                        placeholder='https://push.raven.chat'
                                        {...register('push_notification_server_url', {
                                            required: isRavenCloud ? "Please add your Push Notification Server URL" : false,
                                            maxLength: {
                                                value: 300,
                                                message: "URL cannot be more than 300 characters."
                                            }
                                        })}
                                        aria-invalid={errors.push_notification_server_url ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_server_url && <ErrorText>{errors.push_notification_server_url?.message}</ErrorText>}
                                    <HelperText size='2'>
                                        You can keep this as "https://cloud.ravenchat.ai" if you are using the default Raven Cloud instance.
                                        <br />
                                        Only change this if you are using a custom Raven Cloud instance.
                                    </HelperText>
                                </Box>

                                <Box>
                                    <Label htmlFor='push_notification_api_key'>Push Notification API Key</Label>
                                    <TextField.Root
                                        maxLength={140}
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_api_key'
                                        autoComplete='off'
                                        placeholder='Your API Key'
                                        {...register('push_notification_api_key', {
                                            maxLength: {
                                                value: 140,
                                                message: "API Key cannot be more than 140 characters."
                                            }
                                        })}
                                        aria-invalid={errors.push_notification_api_key ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_api_key && <ErrorText>{errors.push_notification_api_key?.message}</ErrorText>}
                                </Box>
                                <Box>
                                    <Label htmlFor='push_notification_api_secret' isRequired>API Secret</Label>
                                    <TextField.Root
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_api_secret'
                                        required
                                        type='password'
                                        autoComplete='off'
                                        placeholder='••••••••••••••••••••••••••••••••'
                                        {...register('push_notification_api_secret', {
                                            required: isRavenCloud ? "Please add your Push Notification API Secret" : false,
                                        })}
                                        aria-invalid={errors.push_notification_api_secret ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_api_secret && <ErrorText>{errors.push_notification_api_secret?.message}</ErrorText>}
                                </Box>
                            </Stack>
                            : null
                        }


                        <div className='flex gap-2'>
                            {isRavenCloud && ravenSettings?.push_notification_service === "Raven" && ravenSettings?.push_notification_server_url &&
                                <RegisterSiteButton mutate={mutate} ravenSettings={ravenSettings} />}

                            {isRavenCloud && ravenSettings?.push_notification_service === "Raven"
                                && ravenSettings?.push_notification_server_url && ravenSettings?.vapid_public_key && <Button
                                    onClick={() => call.post('raven.api.notification.sync_user_tokens_to_raven_cloud').then(() => {
                                        toast.success('Data syncing to Raven Cloud...')
                                    })}
                                    type='button'
                                    variant='soft'
                                    className='not-cal'>
                                    Sync Data to Raven Cloud
                                </Button>}

                            {!isRavenCloud && <Button
                                asChild
                                color='gray'
                                variant='outline'
                                className='not-cal'>
                                <Link color='gray'
                                    target='_blank'
                                    underline='none'
                                    href={`/app/push-notification-settings`}>

                                    Configure Frappe Push Notifications
                                    <FiExternalLink />
                                </Link>
                            </Button>
                            }
                        </div>

                    </SettingsContentContainer>
                </form>
            </FormProvider>
        </PageContainer>
    )
}

const RegisterSiteButton = ({ mutate, ravenSettings }: { mutate: VoidFunction, ravenSettings: RavenSettings }) => {

    const { call, loading } = useFrappePostCall('raven.api.notification.register_site_on_raven_cloud')

    const registerSite = () => {
        toast.promise(call({}).then(() => mutate()), {
            loading: 'Registering site on Raven Cloud...',
            success: 'Site registered on Raven Cloud. You can now send push notifications.',
            error: (error) => 'Failed to register site on Raven Cloud. ' + (getErrorMessage(error))
        })
    }

    return <Button
        onClick={registerSite}
        disabled={loading}
        variant='soft'
        type='button'
        className='not-cal'>{ravenSettings.vapid_public_key ? "Re-Register Site on Raven Cloud" : "Register Site on Raven Cloud"}</Button>

}

export const Component = PushNotifications