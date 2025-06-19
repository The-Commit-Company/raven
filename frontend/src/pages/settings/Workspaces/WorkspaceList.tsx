import { UserAvatar } from '@/components/common/UserAvatar'
import AddWorkspaceForm from '@/components/feature/workspaces/AddWorkspaceForm'
import WorkspaceActions from '@/components/feature/workspaces/WorkspaceActions'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { useBoolean } from '@/hooks/useBoolean'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { hasRavenAdminRole } from '@/utils/roles'
import { Badge, Button, Dialog, Table, Text } from '@radix-ui/themes'
import { Link, useNavigate } from 'react-router-dom'

const WorkspaceList = () => {
  const { data: myWorkspaces, isLoading, error } = useFetchWorkspaces()

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader
          title='Workspaces'
          description='Không gian làm việc cho phép bạn sắp xếp các kênh và nhóm của mình'
          actions={<AddWorkspaceButton />}
        />
        {isLoading && !error && <TableLoader columns={4} />}
        <ErrorBanner error={error} />
        {myWorkspaces && <MyWorkspacesTable workspaces={myWorkspaces.message} />}
      </SettingsContentContainer>
    </PageContainer>
  )
}

const MyWorkspacesTable = ({ workspaces }: { workspaces: WorkspaceFields[] }) => {
  return (
    <Table.Root variant='surface' className='rounded-sm'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Tên</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Loại</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Thành viên</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Mô tả</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {workspaces?.map((workspace) => (
          <Table.Row key={workspace.name}>
            <Table.Cell maxWidth={'150px'}>
              {workspace.is_admin ? (
                <Link to={`${workspace.name}`} className='hover:underline underline-offset-4'>
                  <HStack align='center'>
                    <UserAvatar src={workspace.logo} alt={workspace.workspace_name} />
                    <Text weight='medium'>{workspace.workspace_name}</Text>
                  </HStack>
                </Link>
              ) : (
                <HStack align='center'>
                  <UserAvatar src={workspace.logo} alt={workspace.workspace_name} />
                  <Text weight='medium'>{workspace.workspace_name}</Text>
                </HStack>
              )}
            </Table.Cell>
            <Table.Cell>
              <Badge color={workspace.type === 'Private' ? 'purple' : 'green'}>
                <ChannelIcon type={workspace.type === 'Private' ? 'Private' : 'Open'} />
                {workspace.type}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <HStack>
                {workspace.is_admin ? (
                  <Badge color='orange'>Admin</Badge>
                ) : workspace.workspace_member_name ? (
                  <Badge color='blue'>Member</Badge>
                ) : (
                  <Badge color='gray'>Not a member</Badge>
                )}
              </HStack>
            </Table.Cell>
            <Table.Cell maxWidth={'250px'}>
              <Text className='line-clamp-1 text-ellipsis'>{workspace.description}</Text>
            </Table.Cell>
            <Table.Cell>
              <WorkspaceActions workspace={workspace} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

const AddWorkspaceButton = () => {
  const isRavenAdmin = hasRavenAdminRole()

  const [isOpen, { off }, setValue] = useBoolean()

  const navigate = useNavigate()

  const onClose = (workspaceID?: string) => {
    if (workspaceID) {
      navigate(`${workspaceID}`)
    }
    off()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setValue}>
      <Dialog.Trigger>
        <Button disabled={!isRavenAdmin}>Tạo mới</Button>
      </Dialog.Trigger>
      <Dialog.Content className={DIALOG_CONTENT_CLASS}>
        <Dialog.Title>Tạo Không Gian Làm Việc</Dialog.Title>
        <Dialog.Description size='2'>
          Không gian làm việc cho phép bạn sắp xếp các kênh và nhóm của mình.
        </Dialog.Description>
        <Stack>
          <AddWorkspaceForm onClose={onClose} />
        </Stack>
      </Dialog.Content>
    </Dialog.Root>
  )
}
export const Component = WorkspaceList
