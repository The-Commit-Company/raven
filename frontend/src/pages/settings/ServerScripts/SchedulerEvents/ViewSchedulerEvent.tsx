import { Loader } from "@/components/common/Loader"
import { DeleteAlert } from "@/components/feature/settings/common/DeleteAlert"
import { SchedulerEventsForm } from "@/components/feature/settings/scheduler-events/SchedulerEventsForm"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader, { HeaderBadge } from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { RavenSchedulerEvent } from "@/types/RavenIntegrations/RavenSchedulerEvent"
import { isEmpty } from "@/utils/validations"
import { Button, DropdownMenu, IconButton } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { BiDotsVerticalRounded } from "react-icons/bi"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

const ViewSchedulerEvent = () => {

    const { ID } = useParams<{ ID: string }>()

    const { data: eventData, error, mutate, isLoading } = useFrappeGetDoc<RavenSchedulerEvent>('Raven Scheduler Event', ID)

    return (
        <PageContainer>
            {error && <ErrorBanner error={error} />}
            {isLoading && <FullPageLoader className="h-64" />}
            {eventData && <ViewSchedulerEventPage data={eventData} onUpdate={mutate} />}
        </PageContainer>
    )
}


const ViewSchedulerEventPage = ({ data, onUpdate }: { data: RavenSchedulerEvent, onUpdate: () => void }) => {

    const [isOpen, setIsOpen] = useState(false)

    const methods = useForm({
        defaultValues: {
            name: data.name,
            send_to: data.send_to,
            event_frequency: data.event_frequency,
            channel: data.channel,
            dm: data.dm,
            bot: data.bot,
            content: data.content,
            hour: data.cron_expression ? data.cron_expression.split(' ')[1] : '',
            minute: data.cron_expression ? data.cron_expression.split(' ')[0] : '',
            date: data.cron_expression ? data.cron_expression.split(' ')[2] : '',
            month: data.cron_expression ? data.cron_expression.split(' ')[3] : '',
            day: data.cron_expression ? data.cron_expression.split(' ')[4] : '',
        }
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)

    const { updateDoc, error, loading } = useFrappeUpdateDoc()

    const onSubmit = (data: any) => {
        let cron_expression = ''
        if (data.event_frequency === 'Every Day') {
            cron_expression = `${data.minute} ${data.hour} * * *`
        }
        if (data.event_frequency === 'Every Day of the week') {
            cron_expression = `${data.minute} ${data.hour} * * ${data.day}`
        }
        if (data.event_frequency === 'Date of the month') {
            cron_expression = `${data.minute} ${data.hour} ${data.date} * *`
        }
        if (data.event_frequency === 'Cron') {
            cron_expression = `${data.minute} ${data.hour} ${data.date} ${data.month} ${data.day}`
        }
        updateDoc('Raven Scheduler Event', data.name, {
            channel: data.channel,
            bot: data.bot,
            event_frequency: data.event_frequency,
            cron_expression: cron_expression,
            content: data.content,
        })
            .then(() => {
                onUpdate()
                toast.success("Scheduler Event updated")
            })
    }

    const onStatusToggle = () => {
        updateDoc('Raven Scheduler Event', data.name, {
            disabled: !data.disabled
        })
            .then(() => {
                onUpdate()
                toast(`Scheduler Event ${data.name} ${data.disabled ? "enabled" : "disabled"}`)
            })
    }

    const onClose = () => {
        setIsOpen(false)
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

    const badges: HeaderBadge[] = data.disabled ? [{ label: "Disabled", color: "gray" }] : [{ label: "Enabled", color: "green" }]

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <SettingsContentContainer>
                    <SettingsPageHeader
                        title={data.event_name}
                        headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : badges}
                        actions={<HStack>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <IconButton aria-label='Options' variant="surface" color="gray">
                                        <BiDotsVerticalRounded />
                                    </IconButton>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content className="min-w-32">
                                    <DropdownMenu.Item onClick={onStatusToggle}>{data.disabled ? "Enable" : "Disable"}</DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item color="red" onClick={() => setIsOpen(true)}>
                                        Delete
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                            <Button type='submit' disabled={loading}>
                                {loading && <Loader className="text-white" />}
                                {loading ? "Saving" : "Save"}
                            </Button>
                        </HStack>

                        }
                        breadcrumbs={[{ label: 'Scheduled Messages', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                    />
                    <ErrorBanner error={error} />
                    <SchedulerEventsForm edit />

                    <DeleteAlert doctype="Raven Scheduler Event" docname={data.name} isOpen={isOpen} onClose={onClose} path={'../../scheduled-messages'} />
                </SettingsContentContainer>
            </form>
        </FormProvider>
    )
}

export const Component = ViewSchedulerEvent