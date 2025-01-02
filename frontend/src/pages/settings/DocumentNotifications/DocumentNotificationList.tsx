import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenDocumentNotification } from '@/types/RavenIntegrations/RavenDocumentNotification'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Checkbox, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { LuBellDot } from 'react-icons/lu'
import { Link } from 'react-router-dom'

const DocumentNotificationList = () => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error } = useFrappeGetDocList<RavenDocumentNotification>("Raven Document Notification", {
        fields: ["name", "document_type", "send_alert_on", "enabled"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    }, isRavenAdmin ? undefined : null, {
        errorRetryCount: 2
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Document Notifications'
                    description='Configure alerts to be sent to users or channels when documents are updated in the system.'
                    actions={<Button asChild disabled={!isRavenAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={4} />}
                <ErrorBanner error={error} />
                {data && data.length > 0 && <DocumentNotificationTable notifications={data} />}
                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <LuBellDot />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Stay in the Loop</EmptyStateTitle>
                    <EmptyStateDescription>
                        Send messages to channels or users based on document activity in your ERP system. Keep your team informed about important changes in real-time with rich document previews.
                    </EmptyStateDescription>
                    {isRavenAdmin && <EmptyStateLinkAction to='create'>
                        Create your first notification
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const DocumentNotificationTable = ({ notifications }: { notifications: RavenDocumentNotification[] }) => {

    const getBadgeColor = (send_alert_on: RavenDocumentNotification['send_alert_on']) => {
        if (send_alert_on === 'New Document') {
            return 'green'
        }
        if (send_alert_on === 'Update') {
            return 'blue'
        }
        if (send_alert_on === 'Submit') {
            return 'orange'
        }
        if (send_alert_on === 'Cancel') {
            return 'red'
        }
        if (send_alert_on === 'Delete') {
            return 'gray'
        }
        return 'gray'
    }

    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Document Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Send Alert On</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Enabled</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {notifications?.map((n) => (
                    <Table.Row key={n.name}>
                        <Table.Cell maxWidth={"250px"}>
                            <HStack align='center'>
                                <Link to={`${n.name}`} className='hover:underline underline-offset-4'>
                                    <Text weight='medium'>{n.name}</Text>
                                </Link>
                            </HStack>
                        </Table.Cell>
                        <Table.Cell maxWidth={"300px"}>
                            <Text className='h-full flex items-center'>{n.document_type}</Text>
                        </Table.Cell>
                        <Table.Cell maxWidth={"150px"}>
                            <Badge color={getBadgeColor(n.send_alert_on)}>{n.send_alert_on}</Badge>
                        </Table.Cell>

                        <Table.Cell>
                            <Checkbox checked={n.enabled === 1} />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

export const Component = DocumentNotificationList