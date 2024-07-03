import { CustomCallout } from '@/components/common/Callouts/CustomCallout'
import { HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { RavenSettings } from '@/types/Raven/RavenSettings'
import { Button, Checkbox, Flex, Select, Separator, Text } from '@radix-ui/themes'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FiAlertTriangle } from 'react-icons/fi'
import { toast } from 'sonner'

const FrappeHR = () => {

    const { ravenSettings, mutate } = useRavenSettings()

    const methods = useForm<RavenSettings>()

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

    //@ts-expect-error
    const isHRInstalled = window?.frappe?.boot?.versions?.hrms !== undefined

    const autoCreateDepartment = watch('auto_create_department_channel')

    return (
        <Flex direction='column' gap='4' px='6' py='4'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex direction={'column'} gap='4'>
                        <Flex justify={'between'} align={'center'}>
                            <Flex direction='column' gap='0'>
                                <Text size='3' className={'font-semibold'}>Frappe HR</Text>
                                {/* <Text size='1' color='gray'>Manage your Raven profile</Text> */}
                            </Flex>
                            <Button type='submit' disabled={updatingDoc}>
                                {updatingDoc && <Loader />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>
                        </Flex>
                        {!isHRInstalled && <CustomCallout
                            iconChildren={<FiAlertTriangle />}
                            rootProps={{ color: 'yellow', variant: 'surface' }}
                            textChildren="Frappe HR is not installed on this site.">
                        </CustomCallout>}

                        <Flex direction={'column'} gap='2' maxWidth={'480px'}>
                            <Text as="label" size="2">
                                <Flex gap="2">
                                    <Controller
                                        control={control}
                                        defaultValue={ravenSettings?.auto_create_department_channel}
                                        name='auto_create_department_channel'
                                        render={({ field }) => (
                                            <Checkbox
                                                checked={field.value ? true : false}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )} />

                                    Automatically create channels for departments
                                </Flex>
                            </Text>
                            <HelperText>
                                If checked, a channel will be created for each department. Employees in the department will be synced with channel members.
                            </HelperText>
                        </Flex>
                        {autoCreateDepartment ?
                            <Flex direction={'column'} maxWidth={'320px'}>
                                <Label isRequired>Department Channel Type</Label>
                                <Controller
                                    control={control}
                                    defaultValue={ravenSettings?.department_channel_type}
                                    name='department_channel_type'
                                    render={({ field }) => (
                                        <Select.Root
                                            value={field.value}
                                            onValueChange={field.onChange}>
                                            <Select.Trigger />
                                            <Select.Content>
                                                <Select.Item value='Private'>
                                                    Private
                                                </Select.Item>
                                                <Select.Item value='Public'>
                                                    Public
                                                </Select.Item>
                                            </Select.Content>
                                        </Select.Root>
                                    )}
                                />
                            </Flex> : null
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
                                                checked={field.value ? true : false}
                                                onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                                            />
                                        )} />

                                    Show if a user is on leave
                                </Flex>
                            </Text>
                            <HelperText>
                                If checked, users on Raven are notified if another user is on leave.
                            </HelperText>
                        </Flex>
                    </Flex>
                </form>
            </FormProvider>
        </Flex>
    )
}

export const Component = FrappeHR