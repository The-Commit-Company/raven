import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateLinkAction,
  EmptyStateTitle
} from '@/components/layout/EmptyState/EmptyListViewState'
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

  const { data, isLoading, error } = useFrappeGetDocList<RavenDocumentNotification>(
    'Raven Document Notification',
    {
      fields: ['name', 'document_type', 'send_alert_on', 'enabled'],
      orderBy: {
        field: 'modified',
        order: 'desc'
      }
    },
    isRavenAdmin ? undefined : null,
    {
      errorRetryCount: 2
    }
  )

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader
          title='Thông báo Tài liệu'
          description='Cấu hình cảnh báo để gửi đến người dùng hoặc các kênh khi tài liệu được cập nhật trong hệ thống.'
          actions={
            <Button asChild disabled={!isRavenAdmin}>
              <Link to='create'>Tạo mới</Link>
            </Button>
          }
        />
        {isLoading && !error && <TableLoader columns={4} />}
        <ErrorBanner error={error} />
        {data && data?.length > 0 && <DocumentNotificationTable notifications={data} />}
        {(data?.length === 0 || !isRavenAdmin) && (
          <EmptyState>
            <EmptyStateIcon>
              <LuBellDot />
            </EmptyStateIcon>
            <EmptyStateTitle>Luôn Luôn Cập Nhật</EmptyStateTitle>
            <EmptyStateDescription>
              Gửi tin nhắn đến các kênh hoặc người dùng dựa trên hoạt động của tài liệu trong hệ thống ERP của bạn. Giữ
              cho nhóm của bạn luôn được cập nhật về các thay đổi quan trọng theo thời gian thực với bản xem trước tài
              liệu đầy đủ.
            </EmptyStateDescription>
            {isRavenAdmin && <EmptyStateLinkAction to='create'>Tạo thông báo đầu tiên</EmptyStateLinkAction>}
          </EmptyState>
        )}
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
    <Table.Root variant='surface' className='rounded-sm animate-fadein'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Tên</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Loại Tài Liệu</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Gửi Cảnh Báo Khi</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Đã Bật</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {notifications?.map((n) => (
          <Table.Row key={n.name}>
            <Table.Cell maxWidth={'250px'}>
              <HStack align='center'>
                <Link to={`${n.name}`} className='hover:underline underline-offset-4'>
                  <Text weight='medium'>{n.name}</Text>
                </Link>
              </HStack>
            </Table.Cell>
            <Table.Cell maxWidth={'300px'}>
              <Text className='h-full flex items-center'>{n.document_type}</Text>
            </Table.Cell>
            <Table.Cell maxWidth={'150px'}>
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
