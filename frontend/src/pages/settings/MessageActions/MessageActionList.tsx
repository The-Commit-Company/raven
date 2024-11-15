import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { Badge, Button, Table } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { Link } from 'react-router-dom'

const MessageActionList = () => {

    const { data, isLoading, error } = useFrappeGetDocList<RavenMessageAction>("Raven Message Action", {
        fields: ["name", "enabled", "action_name", "action"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    })
    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Message Actions'
                    description='Use these to add custom actions - like creating an issue/task from a message.'
                    actions={<Button asChild>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {data && <MessageActionsTable actions={data} />}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const MessageActionsTable = ({ actions }: { actions: RavenMessageAction[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {actions?.map((action) => (
                    <Table.Row key={action.name}>
                        <Table.Cell maxWidth={"150px"}>
                            <HStack align='center'>
                                <Link to={`${action.name}`} className='hover:underline underline-offset-4 font-medium'>
                                    {action.action_name}
                                </Link>

                                {!action.enabled && <Badge color='gray' size='2'>Disabled</Badge>}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"250px"}>
                            <Badge color={
                                action.action === "Create Document" ? "blue" : "purple"
                            } size='2'>{action.action}</Badge>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}
export const Component = MessageActionList