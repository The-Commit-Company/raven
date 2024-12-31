import { User } from "@/types/Core/User"
import { useMemo } from "react"
import { Badge, Box, Checkbox, Flex, Table, Tooltip } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { StandardDate } from "@/utils/dateConversions"
import { FiAlertTriangle } from "react-icons/fi"

interface UsersTableProps {
    data: User[],
    defaultSelected: string[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
}

export const UsersTable = ({ data, selected, setSelected, defaultSelected }: UsersTableProps) => {

    const setAllChecked = (checked: boolean) => {
        if (checked) {
            setSelected((curr) => {
                const user_array: string[] = []
                data.forEach(user => {
                    if (!selected.includes(user.name) && !defaultSelected.includes(user.name)) {
                        user_array.push(user.name)
                    }
                })
                return [...curr, ...user_array]
            })
        } else {
            setSelected([])
        }
    }

    const isAllChecked = useMemo(() => {
        if (data && data.length) {
            let allChecked = true
            data?.forEach(user => {
                if (!selected.includes(user.name) && !defaultSelected.includes(user.name)) {
                    allChecked = false
                }
            })
            return allChecked
        }
        else {
            return false
        }
    }, [selected, data])

    const onCheckboxChange = (v: string) => {
        setSelected(curr => {
            if (curr.includes(v)) {
                return curr.filter((user) => user !== v)
            } else {
                return [...curr, v]
            }
        })
    }

    return (
        <Table.Root variant="surface" className='rounded-sm'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell><Checkbox checked={isAllChecked} onCheckedChange={(e) => setAllChecked(e.valueOf() ? true : false)} /></Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>User ID</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Created on</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((user: User, index) => {
                    const isSelected = selected.includes(user.name) || defaultSelected.includes(user.name)
                    return (
                        <Table.Row key={index}>
                            <Table.RowHeaderCell><Checkbox checked={isSelected} disabled={defaultSelected.includes(user.name)} onCheckedChange={() => onCheckboxChange(user.name)} /></Table.RowHeaderCell>
                            <Table.Cell>
                                <Flex gap='2' align='center'>
                                    <UserAvatar src={user.user_image} alt={user.full_name} />
                                    {user.full_name ?? '-'}
                                </Flex>
                            </Table.Cell>

                            <Table.Cell>{user.name}</Table.Cell>
                            <Table.Cell><StandardDate date={user.creation} /></Table.Cell>
                            <Table.Cell>
                                {user.role_profile_name ?
                                    <Box>
                                        <Tooltip content={<span>A role profile has been assigned to this user.<br />If you want to add the user to Raven, please change their role profile.</span>}>
                                            <Badge color='red' variant="solid">
                                                <FiAlertTriangle size='12' />
                                                Role Profile Added</Badge>
                                        </Tooltip>
                                    </Box> : null}
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table.Root>
    )
}