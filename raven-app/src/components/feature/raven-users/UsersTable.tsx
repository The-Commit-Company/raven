import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, Checkbox, Avatar } from "@chakra-ui/react"
import { User } from "@/types/Core/User"
import { useMemo } from "react"

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
        <TableContainer p={0} overflowY={'auto'} h={'60vh'}>
            <Table size={'sm'}>
                <Thead h='30px'>
                    <Tr>
                        <Th><Checkbox isChecked={isAllChecked} onChange={(e) => setAllChecked(e.target.checked)} /></Th>
                        <Th></Th>
                        <Th>Full name</Th>
                        <Th>User ID</Th>
                        {/* <Th>Created on</Th> */}
                    </Tr>
                </Thead>
                <Tbody>
                    {data?.map((user: User, index) => {

                        const isSelected = selected.includes(user.name) || defaultSelected.includes(user.name)
                        return (
                            <Tr key={index}>
                                <Td><Checkbox isChecked={isSelected} isDisabled={defaultSelected.includes(user.name)} onChange={() => onCheckboxChange(user.name)} /></Td>
                                <Td><Avatar borderRadius={'sm'} boxSize={'10'} name={user.full_name ?? user.name} src={user.user_image ?? ''} /></Td>
                                <Td>{user.full_name ?? '-'}</Td>
                                <Td>{user.name}</Td>
                                {/* <Td>{user.creation.substring(0, 10)}</Td> */}
                            </Tr>
                        )
                    }

                    )}
                </Tbody>
            </Table>
        </TableContainer>
    )
}