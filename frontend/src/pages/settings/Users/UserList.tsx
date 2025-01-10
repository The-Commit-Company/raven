import { UserAvatar } from '@/components/common/UserAvatar'
import AddUserDialog from '@/components/feature/userSettings/Users/AddUserDialog'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { isSystemManager } from '@/utils/roles'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Badge, Table, Text } from '@radix-ui/themes'
import { useContext } from 'react'
import { TableVirtuoso } from 'react-virtuoso'

const UserList = () => {
    const canAddRavenUsers = isSystemManager()

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Users'
                    description='Manage users added to Raven.'
                    actions={canAddRavenUsers ? <AddUserDialog /> : null}
                />
                <UserTable />
            </SettingsContentContainer>
        </PageContainer>
    )
}

const UserTable = () => {

    const { users } = useContext(UserListContext)

    const humanUsers = users.filter(user => user.type === 'User')

    return <TableVirtuoso
        useWindowScroll
        data={humanUsers}
        components={{
            Table: (props) => <Table.Root variant='surface' className='rounded-sm' {...props} />,
            TableHead: Table.Header,
            TableBody: Table.Body,
            TableRow: (props) => <Table.Row className="hover:bg-gray-2" {...props} />,
        }}
        fixedHeaderContent={() => (
            <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            </Table.Row>
        )}
        itemContent={(index, user) => {
            return <UserRow user={user} />
        }}
    />
}

const UserRow = ({ user }: { user: UserFields }) => {
    return <>
        <Table.Cell>
            <HStack align='center'>
                <UserAvatar src={user.user_image} alt={user.full_name} />
                <Text weight='medium'>{user.full_name}</Text>
                {user.enabled ? null : <Badge color='red'>Disabled</Badge>}
            </HStack>
        </Table.Cell>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.custom_status ? <Badge color='gray'>{user.custom_status}</Badge> : null}</Table.Cell>
    </>
}
export const Component = UserList
