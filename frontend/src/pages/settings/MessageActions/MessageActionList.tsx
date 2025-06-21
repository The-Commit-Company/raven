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
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Strong, Table } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { BiBoltCircle } from 'react-icons/bi'
import { Link } from 'react-router-dom'

const MessageActionList = () => {
  const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

  const { data, isLoading, error } = useFrappeGetDocList<RavenMessageAction>(
    'Raven Message Action',
    {
      fields: ['name', 'enabled', 'action_name', 'action'],
      orderBy: {
        field: 'modified',
        order: 'desc'
      }
    },
    undefined,
    {
      errorRetryCount: 2
    }
  )

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader
          title='Hành Động Tin Nhắn'
          description='Sử dụng các hành động này để thêm thao tác tùy chỉnh – như tạo issue hoặc task từ một tin nhắn.'
          actions={
            <Button asChild disabled={!isRavenAdmin}>
              <Link to='create'>Tạo mới</Link>
            </Button>
          }
        />

        {isLoading && !error && <TableLoader columns={2} />}
        <ErrorBanner error={error} />
        {data && data?.length > 0 && <MessageActionsTable actions={data} />}
        {data?.length === 0 && (
          <EmptyState>
            <EmptyStateIcon>
              <BiBoltCircle />
            </EmptyStateIcon>
            <EmptyStateTitle>Hành Động</EmptyStateTitle>
            <EmptyStateDescription>
              Thêm các hành động cho phép bạn tạo tài liệu hoặc gọi API từ nội dung của một tin nhắn – ví dụ như tạo
              phiếu hỗ trợ hoặc lỗi dự án từ tin nhắn gửi trong kênh.
              <br />
              <br />
              Truy cập các hành động này bằng cách nhấn chuột phải vào bất kỳ tin nhắn nào và chọn{' '}
              <Strong>Hành Động</Strong>.
            </EmptyStateDescription>
            {isRavenAdmin && <EmptyStateLinkAction to='create'>Tạo hành động đầu tiên</EmptyStateLinkAction>}
          </EmptyState>
        )}
      </SettingsContentContainer>
    </PageContainer>
  )
}

const MessageActionsTable = ({ actions }: { actions: RavenMessageAction[] }) => {
  return (
    <Table.Root variant='surface' className='rounded-sm animate-fadein'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {actions?.map((action) => (
          <Table.Row key={action.name}>
            <Table.Cell maxWidth={'150px'}>
              <HStack align='center'>
                <Link to={`${action.name}`} className='hover:underline underline-offset-4 font-medium'>
                  {action.action_name}
                </Link>

                {!action.enabled && (
                  <Badge color='gray' size='2'>
                    Disabled
                  </Badge>
                )}
              </HStack>
            </Table.Cell>
            <Table.Cell maxWidth={'250px'}>
              <Badge color={action.action === 'Create Document' ? 'blue' : 'purple'} size='2'>
                {action.action}
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
export const Component = MessageActionList
