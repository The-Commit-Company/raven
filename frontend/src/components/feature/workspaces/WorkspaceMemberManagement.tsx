import { ErrorCallout } from "@/components/common/Callouts/ErrorCallouts"
import { Loader } from "@/components/common/Loader"
import MemberManager, { MemberObject } from "@/components/common/MemberManager"
import { UserAvatar } from "@/components/common/UserAvatar"
import { ErrorBanner, getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { HStack, Stack } from "@/components/layout/Stack"
import { useBoolean } from "@/hooks/useBoolean"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { RavenWorkspaceMember } from "@/types/Raven/RavenWorkspaceMember"
import { UserContext } from "@/utils/auth/UserProvider"
import { getDateObject } from "@/utils/dateConversions/utils"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { __ } from "@/utils/translations"
import { UserFields } from "@/utils/users/UserListProvider"
import { Button, Dialog, DropdownMenu, HoverCard, IconButton, ScrollArea, Separator, Table, Text, Tooltip } from "@radix-ui/themes"
import clsx from "clsx"
import { useFrappeDeleteDoc, useFrappeGetCall, useFrappePostCall, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { lazy, Suspense, useContext, useMemo, useState } from "react"
import { BiCog, BiCrown, BiDotsVerticalRounded, BiPlus, BiSolidCrown } from "react-icons/bi"
import { FiUserMinus } from "react-icons/fi"
import { TableVirtuoso } from "react-virtuoso"
import { toast } from "sonner"

const AddWorkspaceMembersModalContent = lazy(() => import('./AddWorkspaceMemberModalContent'))

type Props = {
    workspaceID: string
}

type WorkspaceMemberFields = Pick<RavenWorkspaceMember, 'user' | 'is_admin' | 'creation' | 'name'>

export const useFetchWorkspaceMembers = (workspaceID: string) => {
    return useFrappeGetCall<{ message: WorkspaceMemberFields[] }>('raven.api.workspaces.fetch_workspace_members', { workspace: workspaceID }, ["workspace_members", workspaceID], {
        revalidateOnFocus: false,
        errorRetryCount: 2
    })
}

const WorkspaceMemberManagement = ({ workspaceID }: Props) => {

    const { data, isLoading, error } = useFetchWorkspaceMembers(workspaceID)

    const { currentUser } = useContext(UserContext)

    const isAdmin = useMemo(() => {
        return data?.message.some((member: any) => member.user === currentUser && member.is_admin) ?? false
    }, [data, currentUser])

    return (
        <Stack>
            <HStack justify='end'>
                <ManageMembersDialog workspaceID={workspaceID} />
                <AddMembersDialog workspaceID={workspaceID} />
            </HStack>
            {isLoading && !error && <TableLoader columns={2} />}
            <ErrorBanner error={error} />
            {data && <MembersTable members={data.message} isAdmin={isAdmin} workspaceID={workspaceID} />}
        </Stack>
    )
}

const MembersTable = ({ members, isAdmin, workspaceID }: { members: WorkspaceMemberFields[], isAdmin: boolean, workspaceID: string }) => {

    const users = useGetUserRecords()

    return <TableVirtuoso
        useWindowScroll
        data={members}
        components={{
            Table: (props) => <Table.Root variant='surface' className='rounded-sm' {...props} />,
            TableHead: Table.Header,
            TableBody: Table.Body,
            TableRow: (props) => (
                <Table.Row
                    className="group hover:bg-gray-2 dark:hover:bg-gray-3 [&:has([data-state='open'])]:bg-gray-2 dark:[&:has([data-state='open'])]:bg-gray-3"
                    {...props}
                />
            ),
        }}
        fixedHeaderContent={() => (
            <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                {isAdmin ? <Table.ColumnHeaderCell></Table.ColumnHeaderCell> : null}
            </Table.Row>
        )}
        itemContent={(index, member) => {
            return <MemberRow users={users} member={member} isAdmin={isAdmin} workspaceID={workspaceID} />
        }}
    />
}

const MemberRow = ({ users, member, isAdmin, workspaceID }: { users: Record<string, UserFields>, member: WorkspaceMemberFields, isAdmin: boolean, workspaceID: string }) => {

    const user = users[member.user]
    return <>
        <Table.Cell>
            <HStack align='center'>
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? member.user} size='2' />
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
            <Text as='span' className="flex items-center h-full">
                {getDateObject(member.creation).format("Do MMMM YYYY")}
            </Text>
        </Table.Cell>
        {isAdmin ? <Table.Cell align='center'><MemberActions member={member} workspaceID={workspaceID} /></Table.Cell> : null}
    </>
}

const MemberActions = ({ member, workspaceID }: { member: WorkspaceMemberFields, workspaceID: string }) => {

    const { mutate } = useSWRConfig()
    const onUpdate = () => {
        mutate(["workspace_members", workspaceID])
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


const ManageMembersDialog = ({ workspaceID }: { workspaceID: string }) => {

    const [isOpen, { off }, setOpen] = useBoolean()
    const { data, isLoading, error } = useFetchWorkspaceMembers(workspaceID)

    return <Dialog.Root open={isOpen} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button className="not-cal" color='gray' size='2' variant="soft" type='button'><BiCog fontSize={16} /> Manage Members</Button>
        </Dialog.Trigger>
        <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'w-full max-w-2xl')}>
            <Dialog.Title>Manage Members</Dialog.Title>
            <Dialog.Description>Add or remove members from your workspace.</Dialog.Description>
            {isLoading && <Loader />}
            <ErrorBanner error={error} />
            {data && <ManageMembersDialogContent workspaceID={workspaceID} onClose={off} members={data.message} />}
        </Dialog.Content>
    </Dialog.Root>

}

const ManageMembersDialogContent = ({ workspaceID, onClose, members }: { workspaceID: string, onClose: () => void, members: WorkspaceMemberFields[] }) => {

    const [newMembers, setNewMembers] = useState<MemberObject[]>(members.map((member) => ({
        user: member.user,
        is_admin: member?.is_admin ? 1 : 0,
        is_member: 1
    })))
    const [hasChanged, setHasChanged] = useState(false)

    const onChange = (members: MemberObject[]) => {
        setHasChanged(true)
        setNewMembers(members)
    }

    const { mutate } = useSWRConfig()

    const [errors, setErrors] = useState<string[]>([])

    const { call, loading, error } = useFrappePostCall('raven.api.workspaces.update_workspace_members')

    const saveMembers = () => {
        call({
            workspace: workspaceID,
            members: newMembers
        }).then((response) => {
            toast.success('Members updated')
            mutate(["workspace_members", workspaceID])
            if (response.errors) {
                setErrors(response.errors)
            } else {
                onClose()
            }
        })
    }

    return <Stack className="pt-4">
        <ErrorBanner error={error} />
        {errors.length > 0 && <ErrorCallout>
            {errors.map((error) => <Text key={error}>{error}</Text>)}
        </ErrorCallout>}
        <MemberManager currentMembers={newMembers} onChange={onChange} />
        <HStack justify='between' pt='4' className="h-full">
            <MemberStats members={newMembers} />
            <HStack>
                <Dialog.Close>
                    <Button size='2' variant='soft' type='button' color='gray' disabled={loading}>Cancel</Button>
                </Dialog.Close>
                <Button size='2' type='button' onClick={saveMembers} disabled={!hasChanged || loading}>
                    {loading ? <Loader className="text-white" /> : null}
                    {loading ? __("Saving") : __("Save")}
                </Button>
            </HStack>
        </HStack>
    </Stack>
}

const MemberStats = ({ members }: { members: MemberObject[] }) => {

    const { admins, memberIDs } = useMemo(() => {
        const memberIDs = members.filter((member) => member.is_member).sort((a, b) => a.user.localeCompare(b.user))
        const admins = memberIDs.filter((member) => member.is_admin)
        return { admins, memberIDs }
    }, [members])

    return <HStack align='center'>
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Text as='span' size='2' className="text-gray-11 h-full flex items-center underline underline-offset-4 decoration-gray-8">
                    {memberIDs.length} members
                </Text>
            </HoverCard.Trigger>
            <HoverCard.Content className="w-72">
                <Text size='2' weight='medium'>Members</Text>
                <Separator className="my-2" size='4' />
                <ScrollArea className="max-h-64 w-full">
                    <ul>
                        {memberIDs.map((member) => <li key={member.user}>
                            <Text as='span' size='2' color='gray' className="h-full flex items-center">
                                {member.user}
                            </Text>
                        </li>)}
                    </ul>
                </ScrollArea>
            </HoverCard.Content>
        </HoverCard.Root>
        <Separator orientation="vertical" />
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Text as='span' size='2' className="text-gray-11 h-full flex items-center underline underline-offset-4 decoration-gray-8">
                    {admins.length} admins
                </Text>
            </HoverCard.Trigger>
            <HoverCard.Content className="w-72">
                <Text size='2' weight='medium'>Admins</Text>
                <Separator className="my-2" size='4' />
                <ScrollArea className="max-h-64 w-full">
                    <ul>
                        {admins.map((admin) => <li key={admin.user}>
                            <Text as='span' size='2' color='gray' className="h-full flex items-center">
                                {admin.user}
                            </Text>
                        </li>)}
                    </ul>
                </ScrollArea>
            </HoverCard.Content>
        </HoverCard.Root>
    </HStack>
}

const AddMembersDialog = ({ workspaceID }: { workspaceID: string }) => {

    const [isOpen, { off }, setOpen] = useBoolean()

    return <Dialog.Root open={isOpen} onOpenChange={setOpen}>
        <Dialog.Trigger>
            <Button size='2' variant='soft' type='button' className="not-cal">
                <BiPlus fontSize={16} />
                Add Members</Button>
        </Dialog.Trigger>
        <Dialog.Content className={clsx('w-full static')}>
            <Dialog.Title>Add Members</Dialog.Title>
            <Dialog.Description>Add members to your workspace.</Dialog.Description>
            <Suspense fallback={<Loader />}>
                <AddWorkspaceMembersModalContent workspaceID={workspaceID} onClose={off} />
            </Suspense>
        </Dialog.Content>
    </Dialog.Root>
}

export default WorkspaceMemberManagement