import { ErrorBanner } from "@/components/layout/AlertBanner"
import { RavenSchedulerEvent } from "@/types/RavenIntegrations/RavenSchedulerEvent"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { Box, Flex, Heading, Button, Section, Blockquote, Badge, Card, Table, Text, Code } from "@radix-ui/themes"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { Link, useNavigate } from "react-router-dom"

export interface Props { }

export const TemporalEvents = (props: Props) => {

    const navigate = useNavigate()

    const { data, error } = useFrappeGetDocList<RavenSchedulerEvent>('Raven Scheduler Event', {
        fields: ['name', 'disabled', 'event_frequency', 'modified'],
        orderBy: {
            field: 'modified',
            order: 'desc'
        }
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
            <Flex>
                {error && <ErrorBanner error={error} />}
                {data?.length === 0 ? <EmptyState /> : <List data={data ?? []} />}
            </Flex>
        </Box>
    )
}


const List = ({ data }: { data: RavenSchedulerEvent[] }) => {
    return (
        <Box width={'100%'}>
            <Card>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Frequency</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Last modified</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {data?.map((item: any) => (<Table.Row key={item.name}>
                            <Table.RowHeaderCell>
                                <Link to={`${item.name}`}>
                                    <Text weight={'medium'} className="hover:underline">{item.name}</Text>
                                </Link>
                            </Table.RowHeaderCell>
                            <Table.Cell>
                                <Badge color={item.disabled ? 'gray' : 'green'}>{item.disabled ? "Disabled" : "Enabled"}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Code>{item.event_frequency}</Code>
                            </Table.Cell>
                            <Table.Cell>
                                <DateMonthAtHourMinuteAmPm date={item.modified} />
                            </Table.Cell>
                        </Table.Row>))}
                    </Table.Body>
                </Table.Root>
            </Card>
        </Box>
    )
}


const EmptyState = () => {
    return (
        <Flex direction='column' gap='4' width='100%'>
            <Text size='2' color="gray">Its empty here...no scheduled messages found. <Link to={'create'} style={{
                textDecoration: 'underline'
            }}>Schedule one</Link>.
            </Text>
        </Flex>
    )
}