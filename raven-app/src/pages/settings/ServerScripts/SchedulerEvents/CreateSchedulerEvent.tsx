import { BackToList } from "@/components/feature/integrations/webhooks/BackToList"
import { SchedulerEventForm, SchedulerEventsForm } from "@/components/feature/settings/scheduler-events/SchedulerEventsForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { Box, Button, Flex, Heading, Section } from "@radix-ui/themes"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const CreateSchedulerEvent = () => {

    const navigate = useNavigate()

    const methods = useForm()

    const { createDoc, error } = useFrappeCreateDoc()

    const onSubmit = (data: Partial<SchedulerEventForm>) => {
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
        createDoc('Raven Scheduler Event', {
            event_name: data.event_name,
            disabled: 0,
            send_to: data.send_to,
            channel: data.channel ?? '',
            dm: data.dm ? data.dm : '',
            bot: data.bot,
            event_frequency: data.event_frequency,
            cron_expression: cron_expression,
            content: data.content,
        })
            .then((doc) => {
                if (doc) {
                    navigate(`../scheduled-messages/${doc?.name}`)
                }
                toast.success("Scheduler Event created")
            })
    }
    //TODO: Figure out a way to show _server_messages in the UI (especially the script editor might have some errors that we need to show to the user)
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-screen">
                    <BackToList label="Scheduled Messages" path="/settings/integrations/scheduled-messages" />
                    <Flex justify={'between'} mt={'6'}>
                        <Heading>New Scheduled Message</Heading>
                        <Button type='submit'>Save</Button>
                    </Flex>
                    <Section size={'2'}>
                        <ErrorBanner error={error} />
                        <SchedulerEventsForm />
                    </Section>
                </Box>
            </form>
        </FormProvider>
    )
}

export const Component = CreateSchedulerEvent