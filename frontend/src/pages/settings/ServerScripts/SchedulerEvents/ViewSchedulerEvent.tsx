import { BackToList } from "@/components/feature/integrations/webhooks/BackToList"
import { DeleteAlert } from "@/components/feature/settings/common/DeleteAlert"
import { SchedulerEventsForm } from "@/components/feature/settings/scheduler-events/SchedulerEventsForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { Badge, Box, Button, DropdownMenu, Flex, Heading, IconButton, Section } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { BiDotsVerticalRounded } from "react-icons/bi"
import { FiArrowLeft, FiChevronDown } from "react-icons/fi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

export interface Props { }

const ViewSchedulerEvent = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data: eventData, error, mutate } = useFrappeGetDoc('Raven Scheduler Event', ID)

    return (
        <>
            {error && <ErrorBanner error={error} />}
            {eventData && <ViewSchedulerEventPage data={eventData} onUpdate={mutate} />}
        </>
    )
}


const ViewSchedulerEventPage = ({ data, onUpdate }: { data: any, onUpdate: () => void }) => {

    const [isOpen, setIsOpen] = useState(false)

    const navigate = useNavigate()

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

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-screen">
                    <BackToList label="Scheduled Messages" path="/settings/integrations/scheduled-messages" />
                    <Flex justify={'between'} mt={'6'}>
                        <Flex align={'center'} gap={'3'}>
                            <Heading>{data.name}</Heading>
                            <Badge color={data.disabled ? 'gray' : 'green'}>{data.disabled ? "Disabled" : "Enabled"}</Badge>
                        </Flex>
                        <Flex gap={'3'}>
                            <Button onClick={() => methods.handleSubmit(onSubmit)} disabled={loading || !methods.formState.isDirty}>Save</Button>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <IconButton aria-label='Options' variant="soft" color="gray" style={{
                                        // @ts-ignore
                                        '--icon-button-ghost-padding': '0',
                                        height: 'var(--base-button-height)',
                                        width: 'var(--base-button-height)',
                                    }}>
                                        <BiDotsVerticalRounded />
                                    </IconButton>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.Item onClick={onStatusToggle}>{data.disabled ? "Enable" : "Disable"}</DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item color="red" onClick={() => setIsOpen(true)}>
                                        Delete
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                            <DeleteAlert doctype="Raven Scheduler Event" docname={data.name} isOpen={isOpen} onClose={onClose} path={'../../scheduled-messages'} />
                        </Flex>
                    </Flex>
                    <Section size={'2'}>
                        <ErrorBanner error={error} />
                        <SchedulerEventsForm edit />
                    </Section>
                </Box>
            </form>
        </FormProvider>
    )
}

export const Component = ViewSchedulerEvent