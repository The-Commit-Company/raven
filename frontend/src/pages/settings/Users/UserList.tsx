import { UserAvatar } from '@/components/common/UserAvatar'
import AddUserDialog from '@/components/feature/userSettings/Users/AddUserDialog'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { useBoolean } from '@/hooks/useBoolean'
import { isSystemManager } from '@/utils/roles'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Badge, Button, Table, Text } from '@radix-ui/themes'
import { useContext } from 'react'

const UserList = () => {

    const { users } = useContext(UserListContext)

    const canAddRavenUsers = isSystemManager()

    const [open, { on, off }] = useBoolean()

    const humanUsers = users.filter(user => user.type === 'User')

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Users'
                    description='Manage users added to Raven.'
                    actions={canAddRavenUsers ? <Button onClick={on}>
                        Add
                    </Button> : null}
                />
                <UserTable users={humanUsers} />
            </SettingsContentContainer>
            <AddUserDialog open={open} onClose={off} />
        </PageContainer>
    )
}

const UserTable = ({ users }: { users: UserFields[] }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {users.map((user) => (
                    <Table.Row key={user.name}>
                        <Table.Cell>
                            <HStack align='center'>
                                <UserAvatar src={user.user_image} alt={user.full_name} />
                                <Text weight='medium'>{user.full_name}</Text>
                                {user.enabled ? null : <Badge color='red'>Disabled</Badge>}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell>{user.name}</Table.Cell>
                        <Table.Cell>{user.custom_status ? <Badge color='gray'>{user.custom_status}</Badge> : null}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}
export const Component = UserList