import { SchedulerEventForm, SchedulerEventsForm } from "@/components/feature/settings/scheduler-events/SchedulerEventsForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useToast } from "@/hooks/useToast"
import { Box, Button, Flex, Heading, Section } from "@radix-ui/themes"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

export const CreateSchedulerEvent = () => {

    const navigate = useNavigate()

    const methods = useForm()

    const { createDoc, error } = useFrappeCreateDoc()

    const { toast } = useToast()

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
        // console.log(data, cron_expression)
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
                    navigate(`../${doc?.name}`)
                }
                toast({
                    title: `Temporal Event created`,
                    variant: 'success',
                })
            })
    }
    //TODO: Figure out a way to show _server_messages in the UI (especially the script editor might have some errors that we need to show to the user)
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9">
                    <Button variant="ghost" onClick={() => navigate('../../scheduled-scripts')}>
                        <FiArrowLeft /> Scheduler Events
                    </Button>
                    <Flex justify={'between'} mt={'6'}>
                        <Heading>New Scheduler Event</Heading>
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