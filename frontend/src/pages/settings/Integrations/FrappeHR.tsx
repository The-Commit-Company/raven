import { CustomCallout } from '@/components/common/Callouts/CustomCallout'
import { HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import CompanyWorkspaceMapping from '@/components/feature/hr/CompanyWorkspaceMapping'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { Stack } from '@/components/layout/Stack'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { RavenSettings } from '@/types/Raven/RavenSettings'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { __ } from '@/utils/translations'
import { Button, Checkbox, Flex, Select, Separator, Text } from '@radix-ui/themes'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FiAlertTriangle } from 'react-icons/fi'
import { toast } from 'sonner'

const FrappeHR = () => {

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

    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc<RavenSettings>()

    //@ts-expect-error
    const isHRInstalled = window?.frappe?.boot?.versions?.hrms !== undefined

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
                return __("Settings updated");
            },
            error: __("There was an error."),
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

    const autoCreateDepartment = watch('auto_create_department_channel')

    return (
        <PageContainer>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title={__('HR')}
                            description={__("Connect your HR system to Raven to sync employee data and send notifications.")}
                            actions={<Button type='submit' disabled={updatingDoc || !isRavenAdmin}>
                                {updatingDoc && <Loader className="text-white" />}
                                {updatingDoc ? __("Saving") : __("Save")}
                            </Button>}
                        />
                        {!isHRInstalled && <CustomCallout
                            iconChildren={<FiAlertTriangle />}
                            rootProps={{ color: 'yellow', variant: 'surface' }}
                            textChildren={__("HR is not installed on this site.")} >
                        </CustomCallout>}

                        <ErrorBanner error={error} />

                        <Flex direction={'column'} gap='2' maxWidth={'480px'}>
                            <Text as="label" size="2">
                                <Flex gap="2">
                                    <Controller
                                        control={control}
                                        defaultValue={ravenSettings?.auto_create_department_channel}
                                        name='auto_create_department_channel'
                                        render={({ field }) => (
                                            <Checkbox
                                                disabled={field.disabled}
                                                name={field.name}
                                                checked={field.value ? true : false}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )} />

                                    {__("Automatically create channels for departments")}
                                </Flex>
                            </Text>
                            <HelperText>
                                {__("If checked, a channel will be created for each department. Employees in the department will be synced with channel members.")}
                            </HelperText>
                        </Flex>
                        {autoCreateDepartment ?
                            <Stack>
                                <Flex direction={'column'} maxWidth={'320px'}>
                                    <Label isRequired htmlFor='department_channel_type'>{__("Department Channel Type")}</Label>
                                    <Controller
                                        control={control}
                                        defaultValue={ravenSettings?.department_channel_type}
                                        name='department_channel_type'
                                        render={({ field }) => (
                                            <Select.Root
                                                value={field.value}
                                                disabled={field.disabled}
                                                name={field.name}
                                                onValueChange={field.onChange}>
                                                <Select.Trigger />
                                                <Select.Content>
                                                    <Select.Item value='Private'>
                                                        {__("Private")}
                                                    </Select.Item>
                                                    <Select.Item value='Public'>
                                                        {__("Public")}
                                                    </Select.Item>
                                                </Select.Content>
                                            </Select.Root>
                                        )}
                                    />
                                </Flex>

                                <CompanyWorkspaceMapping />
                            </Stack>
                            : null
                        }
                        <Separator size='4' />
                        <Flex direction={'column'} gap='2' maxWidth={'480px'}>
                            <Text as="label" size="2">
                                <Flex gap="2">
                                    <Controller
                                        control={control}
                                        defaultValue={ravenSettings?.show_if_a_user_is_on_leave}
                                        name='show_if_a_user_is_on_leave'
                                        render={({ field }) => (
                                            <Checkbox
                                                name={field.name}
                                                disabled={field.disabled}
                                                checked={field.value ? true : false}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )} />

                                    {__("Show if a user is on leave")}
                                </Flex>
                            </Text>
                            <HelperText>
                                {__("If checked, users on Raven are notified if another user is on leave.")}
                            </HelperText>
                        </Flex>
                    </SettingsContentContainer>
                </form>
            </FormProvider>
        </PageContainer>
    )
}

export const Component = FrappeHR