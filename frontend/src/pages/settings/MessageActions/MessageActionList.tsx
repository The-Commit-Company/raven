import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Strong, Table } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { BiBoltCircle } from 'react-icons/bi'
import { Link } from 'react-router-dom'

const MessageActionList = () => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error } = useFrappeGetDocList<RavenMessageAction>("Raven Message Action", {
        fields: ["name", "enabled", "action_name", "action"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    }, undefined, {
        errorRetryCount: 2
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Message Actions'
                    description='Use these to add custom actions - like creating an issue/task from a message.'
                    actions={<Button asChild disabled={!isRavenAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {data && data.length > 0 && <MessageActionsTable actions={data} />}
                {data?.length === 0 && <EmptyState>
                    <EmptyStateIcon>
                        <BiBoltCircle />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Actions</EmptyStateTitle>
                    <EmptyStateDescription>
                        Add actions that allow you to create documents or make API calls from the contents of a message - like creating a support ticket or project issue from a message sent in a channel.
                        <br /><br />
                        Access them by right clicking any message and selecting <Strong>Actions</Strong>.
                    </EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first action
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const MessageActionsTable = ({ actions }: { actions: RavenMessageAction[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
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