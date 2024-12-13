import { UserAvatar } from '@/components/common/UserAvatar'
import WorkspaceActions from '@/components/feature/workspaces/WorkspaceActions'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { hasRavenAdminRole } from '@/utils/roles'
import { Badge, Button, Dialog, Table, Text, Tooltip } from '@radix-ui/themes'
import { VscVerifiedFilled } from 'react-icons/vsc'
import { BiSolidCrown } from 'react-icons/bi'
import { useBoolean } from '@/hooks/useBoolean'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import AddWorkspaceForm from '@/components/feature/workspaces/AddWorkspaceForm'
import { useNavigate } from 'react-router-dom'

const WorkspaceList = () => {

    const { data: myWorkspaces, isLoading, error } = useFetchWorkspaces()

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Workspaces'
                    description='Workspaces allow you to organize your channels and teams.'
                    actions={<AddWorkspaceButton />}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {myWorkspaces && <MyWorkspacesTable workspaces={myWorkspaces.message} />}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const MyWorkspacesTable = ({ workspaces }: { workspaces: WorkspaceFields[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {workspaces?.map((workspace) => (
                    <Table.Row key={workspace.name}>
                        <Table.Cell maxWidth={"150px"}>
                            <HStack align='center'>
                                <HStack align='center'>
                                    <UserAvatar src={workspace.logo} alt={workspace.workspace_name} />
                                    <Text weight='medium'>{workspace.workspace_name}</Text>
                                    <HStack>
                                        {workspace.workspace_member_name ? <Tooltip content='You are a member'>
                                            <Text as='span' className='h-full flex items-center'>
                                                <VscVerifiedFilled fontSize={18} className='text-green-9' />
                                            </Text>
                                        </Tooltip> : null}
                                        {workspace.is_admin ? <Tooltip content='You are an admin'>
                                            <Text as='span' className='h-full flex items-center'>
                                                <BiSolidCrown fontSize={18} color='#FFC53D' />
                                            </Text>
                                        </Tooltip> : null}
                                    </HStack>
                                </HStack>
                            </HStack>
                        </Table.Cell>
                        <Table.Cell>
                            <Badge color={workspace.type === 'Private' ? 'blue' : 'green'}>{workspace.type}</Badge>
                        </Table.Cell>
                        <Table.Cell maxWidth={"250px"}>
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

    return <Dialog.Root open={isOpen} onOpenChange={setValue}>
        <Dialog.Trigger>
            <Button disabled={!isRavenAdmin}>Create</Button>
        </Dialog.Trigger>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            <Dialog.Title>Create Workspace</Dialog.Title>
            <Dialog.Description size='2'>Workspaces allow you to organize your channels and teams.</Dialog.Description>
            <Stack>
                <AddWorkspaceForm onClose={onClose} />
            </Stack>
        </Dialog.Content>
    </Dialog.Root>

}
export const Component = WorkspaceList