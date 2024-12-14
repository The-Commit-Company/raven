import { HStack, Stack } from "../layout/Stack"
import { Checkbox, Table, Text, TextField } from "@radix-ui/themes"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"
import { UserAvatar } from "./UserAvatar"
import { useContext, useEffect, useMemo, useState } from "react"
import { BiSearch } from "react-icons/bi"
import { TableVirtuoso } from "react-virtuoso"

export type MemberObject = { user: string, is_admin?: 0 | 1, is_member?: 0 | 1 }
type Props = {
    currentMembers: MemberObject[]
    onChange: (members: MemberObject[]) => void
}

/**
 * Common component to manage members of a workspace/channel
 */
const MemberManager = ({ currentMembers, onChange }: Props) => {

    const { users } = useContext(UserListContext)

    const [search, setSearch] = useState('')

    const onMemberChange = (user: string, is_member?: boolean, is_admin?: boolean) => {
        // Add the member after removing the existing member
        const newMembers = currentMembers.filter((member) => member.user !== user)
        newMembers.push({ user, is_admin: is_admin && is_member ? 1 : 0, is_member: is_member ? 1 : 0 })
        onChange(newMembers)
    }

    const filteredUsers = useMemo(() => {
        return users.filter((user) => user.full_name.toLowerCase().includes(search.toLowerCase()))
    }, [users, search])

    const userMembershipMap: Record<string, { is_admin: boolean, is_member: boolean }> = currentMembers.reduce((acc, member) => {
        acc[member.user] = {
            is_admin: member.is_admin ? true : false,
            is_member: member.is_member ? true : false
        }
        return acc
    }, {} as Record<string, { is_admin: boolean, is_member: boolean }>)

    return (
        <Stack>
            <SearchBar onSearch={setSearch} />
            <Stack className="max-h-[600px] overflow-y-auto transition-height duration-300">
                <TableVirtuoso
                    style={{ height: '540px' }}
                    data={filteredUsers}
                    components={{
                        Table: (props) => <Table.Root size='1' {...props} />,
                        TableHead: Table.Header,
                        TableBody: Table.Body,
                        TableRow: (props) => <Table.Row className="hover:bg-gray-2" {...props} />,
                    }}
                    fixedHeaderContent={() => (
                        <Table.Row>
                            <Table.ColumnHeaderCell className="w-[50%]">User</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="w-[25%]">Member</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="w-[25%]">Admin</Table.ColumnHeaderCell>
                        </Table.Row>
                    )}
                    itemContent={(index, user) => {
                        return <MemberRow member={user} membership={userMembershipMap[user.name]} key={user.name} onMemberChange={onMemberChange} />
                    }}
                />
            </Stack>
        </Stack>
    )
}

const SearchBar = ({ onSearch }: { onSearch: (search: string) => void }) => {

    const [search, setSearch] = useState('')

    useEffect(() => {
        // Debounced search
        const timeout = setTimeout(() => {
            onSearch(search)
        }, 250)
        return () => clearTimeout(timeout)
    }, [search])

    return (
        <TextField.Root placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}>
            <TextField.Slot>
                <BiSearch />
            </TextField.Slot>
        </TextField.Root>
    )
}

interface MemberRowProps {
    member: UserFields
    membership?: { is_admin: boolean, is_member: boolean }
    onMemberChange: (user: string, is_member?: boolean, is_admin?: boolean) => void
}

const MemberRow = ({ member, onMemberChange, membership }: MemberRowProps) => {

    return (
        <>
            <Table.Cell className="w-[50%]" onClick={() => onMemberChange(member.name, !membership?.is_member, membership?.is_admin)}>
                <HStack justify='between'>
                    <HStack align='center'>
                        <UserAvatar size='2' loading="eager" src={member.user_image} alt={member.full_name ?? member.name} />
                        <Text as='span' weight='medium'>{member.full_name ?? member.name}</Text>
                    </HStack>
                </HStack>
            </Table.Cell>
            <Table.Cell className="w-[25%]">
                <div className="flex h-full justify-start items-center px-2">
                    <Checkbox
                        name={`member-${member.name}`}
                        checked={membership?.is_member}
                        onCheckedChange={(checked) => onMemberChange(member.name, checked ? true : false, membership?.is_admin)} />
                </div>
            </Table.Cell>
            <Table.Cell className="w-[25%]">
                <div className="flex h-full justify-start items-center px-2">
                    <Checkbox
                        checked={membership?.is_admin}
                        disabled={!membership?.is_member}
                        onCheckedChange={(checked) => onMemberChange(member.name, membership?.is_member, checked ? true : false)} />
                </div>
            </Table.Cell>
        </>
    )
}

export default MemberManager