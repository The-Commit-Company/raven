import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { RavenSchedulerEvent } from "@/types/RavenIntegrations/RavenSchedulerEvent"
import { Box, Flex, Heading, Button, Section, Blockquote, Text } from "@radix-ui/themes"
import { useFrappeDocTypeEventListener, useFrappeGetDocList } from "frappe-react-sdk"
import { Link, useNavigate } from "react-router-dom"
import { List } from "./ScheduledMessageList"

export interface Props { }

const SchedulerEvents = (props: Props) => {

    const navigate = useNavigate()

    const { data, error, isLoading, mutate } = useFrappeGetDocList<RavenSchedulerEvent>('Raven Scheduler Event', {
        fields: ['name', 'disabled', 'event_frequency', 'creation', 'owner'],
        orderBy: {
            field: 'modified',
            order: 'desc'
        }
    })

    useFrappeDocTypeEventListener('Raven Scheduler Event', () => {
        mutate()
    })

    return (
        <Box className="lg:mx-[10rem] md:mx-[5rem] mt-9 h-screen">
            <Flex justify={'between'}>
                <Heading>Scheduled Messages</Heading>
                <Button onClick={() => navigate('create')}>Add</Button>
            </Flex>
            <Section size={'2'}>
                <Blockquote size={'2'}>
                    Lets say you want to be reminded to file your GST returns every month on the 10th. You can create a scheduled message & a bot will remind you to do so.
                </Blockquote>
            </Section>
            <Flex direction={'column'}>
                {error && <ErrorBanner error={error} />}
                {isLoading && <FullPageLoader className="h-auto" text='Loading...' />}
                {data?.length === 0 ? null : <List data={data ?? []} />}
            </Flex>
        </Box>
    )
}

export const Component = SchedulerEvents