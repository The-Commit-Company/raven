import { useDebounce } from "@/hooks/useDebounce"
import { usePaginationWithDoctype } from "@/hooks/usePagination"
import { User } from "@/types/Core/User"
import { Filter, useFrappeGetDocList, useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { ChangeEvent, useContext, useState } from "react"
import { Sort } from "../sorting"
import { PageLengthSelector } from "../pagination/PageLengthSelector"
import { PageSelector } from "../pagination/PageSelector"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { UsersTable } from "./UsersTable"
import { UserListContext } from "@/utils/users/UserListProvider"
import { Button, Dialog, Em, Flex, Strong, Text, TextField } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { BiSearch } from "react-icons/bi"
import { useToast } from "@/hooks/useToast"
import { ErrorCallout } from "@/components/layout/AlertBanner/ErrorBanner"

interface AddUsersResponse {
    failed_users: User[],
    success_users: User[]
}
const AddRavenUsersContent = ({ onClose }: { onClose: VoidFunction }) => {

    const { mutate } = useSWRConfig()
    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const filters: Filter[] = [['enabled', '=', 1], ['name', 'not in', ['Guest', 'Administrator']], ['full_name', 'like', `%${debouncedText}%`]]

    const { start, count, selectedPageLength, setPageLength, nextPage, previousPage } = usePaginationWithDoctype("User", 10, filters)
    const [sortOrder, setSortOder] = useState<"asc" | "desc">("desc")

    const { data, error } = useFrappeGetDocList<User>("User", {
        fields: ["name", "full_name", "user_image", "creation", "enabled", "user_type", "role_profile_name"],
        filters,
        orderBy: {
            field: 'creation',
            order: sortOrder
        },
        limit_start: start > 0 ? (start - 1) : 0,
        limit: selectedPageLength
    })

    const users = useContext(UserListContext)
    const ravenUsersArray = users.enabledUsers.map(user => user.name)

    const [selected, setSelected] = useState<string[]>([])
    const { loading, call, error: postError } = useFrappePostCall<{ message: AddUsersResponse }>('raven.api.raven_users.add_users_to_raven')
    const { toast } = useToast()

    const [failedUsers, setFailedUsers] = useState<User[]>([])

    const handleAddUsers = async () => {
        setFailedUsers([])
        if (selected.length > 0) {

            call({
                users: JSON.stringify(selected)
            }).then((res) => {
                if (res.message.success_users.length !== 0) {
                    toast({
                        title: `You have added ${res.message.success_users.length} users to Raven`,
                        variant: 'success',
                        duration: 1000
                    })
                }

                mutate('raven.api.raven_users.get_list')

                if (res.message.failed_users.length === 0) {
                    onClose()
                    setSelected([])
                } else {
                    setFailedUsers(res.message.failed_users)
                    setSelected(s => s.filter(user => res.message.failed_users.map(u => u.name).includes(user)))
                }
            })
        }
    }

    return (
        <div>
            <Dialog.Title>Add users to Raven</Dialog.Title>

            <Flex direction='column' gap='4' pt='4'>
                <Flex justify='between' gap='2'>
                    <Flex gap='2' align='center'>
                        <TextField.Root>
                            <TextField.Slot>
                                <BiSearch />
                            </TextField.Slot>
                            <TextField.Input
                                onChange={handleChange}
                                type='text'
                                placeholder='Search for user' />
                        </TextField.Root>
                        {debouncedText.length > 0 && debouncedText.length < 2 && <Text size='1' color="gray">Continue typing...</Text>}
                    </Flex>
                    <Flex justify='end' gap='2' align='center'>
                        <Sort
                            sortOrder={sortOrder}
                            onSortOrderChange={(order) => setSortOder(order)} />
                        <PageLengthSelector
                            options={[10, 20, 50, 100]}
                            selectedValue={selectedPageLength}
                            updateValue={(value) => setPageLength(value)} />
                        <PageSelector
                            rowsPerPage={selectedPageLength}
                            start={start}
                            totalRows={count!}
                            gotoNextPage={() => nextPage()}
                            gotoPreviousPage={() => previousPage()} />
                    </Flex>
                </Flex>

                <ErrorBanner error={error} />
                <ErrorBanner error={postError} />
                {failedUsers.length > 0 && <ErrorCallout>
                    Could not add the following users to Raven since they have a <Strong>Role Profile</Strong> attached.<br />
                    Please remove the role profile and try again.<br /><br />

                    <ol className="pl-4">
                        {failedUsers.map((user, i) => <li key={i}><Text as='span'><Strong>{user.full_name}</Strong> - {user.email}</Text></li>)}
                    </ol>

                </ErrorCallout>}
                {!data && !error && <TableLoader columns={3} />}

                {data && data.length === 0 && debouncedText.length >= 2 &&
                    <Flex align='center' justify='center' className="min-h-[32rem]">
                        <Text size='2' align='center'>No results found</Text>
                    </Flex>}

                {data && data.length !== 0 && <UsersTable data={data} defaultSelected={ravenUsersArray} selected={selected} setSelected={setSelected} />}

            </Flex>
            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close disabled={loading}>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </Dialog.Close>
                <Button type='button' disabled={loading} onClick={handleAddUsers}>
                    {loading && <Loader />}
                    {loading ? "Adding" : "Add to Raven"}
                </Button>
            </Flex>
        </div>
    )
}

export default AddRavenUsersContent