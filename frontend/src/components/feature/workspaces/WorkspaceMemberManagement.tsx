import { UserAvatar } from "@/components/common/UserAvatar"
import { ErrorBanner, getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { HStack, Stack } from "@/components/layout/Stack"
import { useGetUser } from "@/hooks/useGetUser"
import { RavenWorkspaceMember } from "@/types/Raven/RavenWorkspaceMember"
import { UserContext } from "@/utils/auth/UserProvider"
import { getDateObject } from "@/utils/dateConversions/utils"
import { Button, DropdownMenu, IconButton, Table, Text, Tooltip } from "@radix-ui/themes"
import { useFrappeDeleteDoc, useFrappeGetCall, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { useContext, useMemo } from "react"
import { BiCrown, BiDotsVerticalRounded, BiSolidCrown } from "react-icons/bi"
import { FiUserMinus } from "react-icons/fi"
import { toast } from "sonner"

type Props = {
    workspaceID: string
}

type WorkspaceMemberFields = Pick<RavenWorkspaceMember, 'user' | 'is_admin' | 'creation' | 'name'>

const WorkspaceMemberManagement = ({ workspaceID }: Props) => {

    const { data, isLoading, error } = useFrappeGetCall<{ message: WorkspaceMemberFields[] }>('raven.api.workspaces.fetch_workspace_members', { workspace: workspaceID }, `fetch_workspace_members_${workspaceID}`, {
        revalidateOnFocus: false,
        errorRetryCount: 2
    })

    const { currentUser } = useContext(UserContext)

    const isAdmin = useMemo(() => {
        return data?.message.some((member: any) => member.user === currentUser && member.is_admin) ?? false
    }, [data, currentUser])

    return (
        <Stack>
            <HStack justify='end'>
                <Button className="not-cal" size='2' variant="soft" type='button'>Manage Members</Button>
            </HStack>
            {isLoading && !error && <TableLoader columns={2} />}
            <ErrorBanner error={error} />
            {data && <MembersTable members={data.message} isAdmin={isAdmin} workspaceID={workspaceID} />}
        </Stack>
    )
}

const MembersTable = ({ members, isAdmin, workspaceID }: { members: WorkspaceMemberFields[], isAdmin: boolean, workspaceID: string }) => {

    return <Table.Root variant="surface" className='rounded-sm'>
        <Table.Header>
            <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                {isAdmin ? <Table.ColumnHeaderCell></Table.ColumnHeaderCell> : null}
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {members.map((member) => <MemberRow key={member.name} member={member} isAdmin={isAdmin} workspaceID={workspaceID} />)}
        </Table.Body>
    </Table.Root>
}

const MemberRow = ({ member, isAdmin, workspaceID }: { member: WorkspaceMemberFields, isAdmin: boolean, workspaceID: string }) => {

    const user = useGetUser(member.user)
    return <Table.Row>
        <Table.Cell>
            <HStack align='center'>
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? member.user} />
                <Text as='span'>
                    {user?.full_name ?? member.user}
                </Text>
                {member.is_admin ? <Tooltip content='Admin'>
                    <Text as='span' className='h-full flex items-center'>
                        <BiSolidCrown fontSize={18} color='#FFC53D' />
                    </Text>
                </Tooltip> : null}
            </HStack>
        </Table.Cell>
        <Table.Cell>
            {getDateObject(member.creation).format("Do MMMM YYYY")}
        </Table.Cell>
        {isAdmin ? <Table.Cell><MemberActions member={member} workspaceID={workspaceID} /></Table.Cell> : null}
    </Table.Row>
}

const MemberActions = ({ member, workspaceID }: { member: WorkspaceMemberFields, workspaceID: string }) => {

    const { mutate } = useSWRConfig()
    const onUpdate = () => {
        mutate(`fetch_workspace_members_${workspaceID}`)
    }

    return <div className='flex items-center gap-2 justify-center h-full'>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <IconButton variant='ghost' color='gray' size='3'>
                    <BiDotsVerticalRounded fontSize={16} />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className='min-w-36'>
                {member.is_admin ? <RemoveAdminButton memberID={member.name} onUpdate={onUpdate} /> : <MakeAdminButton memberID={member.name} onUpdate={onUpdate} />}
                <RemoveMemberButton memberID={member.name} onUpdate={onUpdate} />
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
}

const RemoveMemberButton = ({ memberID, onUpdate }: { memberID: string, onUpdate: () => void }) => {

    const { deleteDoc } = useFrappeDeleteDoc()

    const removeMember = () => {
        deleteDoc('Raven Workspace Member', memberID)
            .then(() => {
                onUpdate()
                toast.success('Member removed')
            })
            .catch((error) => {
                toast.error('Failed to remove member', {
                    description: getErrorMessage(error),
                    duration: 4000
                })
            })
    }

    return <DropdownMenu.Item onClick={removeMember} color='red'>
        <FiUserMinus fontSize={16} />
        Remove Member
    </DropdownMenu.Item>
}

const MakeAdminButton = ({ memberID, onUpdate }: { memberID: string, onUpdate: () => void }) => {

    const { updateDoc } = useFrappeUpdateDoc()

    const makeAdmin = () => {
        updateDoc('Raven Workspace Member', memberID, { is_admin: true })
            .then(() => {
                onUpdate()
                toast.success('Success')
            })
            .catch((error) => {
                toast.error('Failed to make add admin', {
                    description: getErrorMessage(error),
                    duration: 4000
                })
            })
    }

    return <DropdownMenu.Item onClick={makeAdmin}>
        <BiCrown fontSize={16} />
        Make Admin
    </DropdownMenu.Item>
}

const RemoveAdminButton = ({ memberID, onUpdate }: { memberID: string, onUpdate: () => void }) => {

    const { updateDoc } = useFrappeUpdateDoc()

    const removeAdmin = () => {
        updateDoc('Raven Workspace Member', memberID, { is_admin: false })
            .then(() => {
                onUpdate()
                toast.success('Success')
            })
            .catch((error) => {
                toast.error('Failed to remove admin', {
                    description: getErrorMessage(error),
                    duration: 4000
                })
            })
    }

    return <DropdownMenu.Item onClick={removeAdmin}>
        <BiCrown fontSize={16} />
        Remove Admin
    </DropdownMenu.Item>
}

export default WorkspaceMemberManagement