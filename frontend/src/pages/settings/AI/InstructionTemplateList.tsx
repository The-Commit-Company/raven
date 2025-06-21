import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
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
import { RavenBotInstructionTemplate } from '@/types/RavenAI/RavenBotInstructionTemplate'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { Badge, Button, Code, Table, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { BiFile } from 'react-icons/bi'
import { RiSparkling2Fill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

const InstructionTemplateList = () => {
  const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

  const { data, isLoading, error } = useFrappeGetDocList<RavenBotInstructionTemplate>(
    'Raven Bot Instruction Template',
    {
      fields: ['name', 'template_name', 'dynamic_instructions', 'instruction'],
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
          title='Mẫu Hướng Dẫn'
          description='Lưu các hướng dẫn thường dùng dưới dạng mẫu để sử dụng cho bot của bạn.'
          actions={
            <Button asChild disabled={!isRavenAdmin}>
              <Link to='create'>Tạo mới</Link>
            </Button>
          }
        />
        {isLoading && !error && <TableLoader columns={2} />}
        <ErrorBanner error={error} />
        <AINotEnabledCallout />
        {data && data?.length > 0 && <InstructionTable data={data} />}
        {(data?.length === 0 || !isRavenAdmin) && (
          <EmptyState>
            <EmptyStateIcon>
              <BiFile />
            </EmptyStateIcon>
            <EmptyStateTitle>Mẫu Hướng Dẫn Cho AI</EmptyStateTitle>
            <EmptyStateDescription>
              Hầu hết các bot cần những loại hướng dẫn tương tự để thực hiện nhiệm vụ, như "định dạng ngày theo
              DD-MM-YYYY" hoặc "người dùng hiện tại là <Code color='gray'>{'{{user}}'}</Code>".
              <br />
              Lưu các hướng dẫn thường dùng dưới dạng mẫu để sử dụng cho bot AI của bạn.
            </EmptyStateDescription>
            {isRavenAdmin && <EmptyStateLinkAction to='create'>Tạo mẫu đầu tiên</EmptyStateLinkAction>}
          </EmptyState>
        )}
      </SettingsContentContainer>
    </PageContainer>
  )
}

const InstructionTable = ({ data }: { data: RavenBotInstructionTemplate[] }) => {
  return (
    <Table.Root variant='surface' className='rounded-sm animate-fadein'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data?.map((d) => (
          <Table.Row key={d.name}>
            <Table.Cell maxWidth={'150px'}>
              <HStack align='center'>
                <Link to={`${d.name}`} className='hover:underline underline-offset-4'>
                  <Text weight='medium'>{d.template_name}</Text>
                </Link>
                {d.dynamic_instructions ? (
                  <Badge color='purple'>
                    <RiSparkling2Fill /> Dynamic
                  </Badge>
                ) : null}
              </HStack>
            </Table.Cell>
            <Table.Cell maxWidth={'250px'}>
              <Text className='line-clamp-1 text-ellipsis'>{d.instruction}</Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export const Component = InstructionTemplateList
