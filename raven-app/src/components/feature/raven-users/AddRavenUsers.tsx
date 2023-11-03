import { useDebounce } from "@/hooks/useDebounce"
import { usePaginationWithDoctype } from "@/hooks/usePagination"
import { User } from "@/types/Core/User"
import { SearchIcon } from "@chakra-ui/icons"
import { Button, ButtonGroup, HStack, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Center, useToast } from "@chakra-ui/react"
import { Filter, useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk"
import { ChangeEvent, useContext, useState } from "react"
import { Sort } from "../sorting"
import { PageLengthSelector } from "../pagination/PageLengthSelector"
import { PageSelector } from "../pagination/PageSelector"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { UsersTable } from "./UsersTable"
import { UserListContext } from "@/utils/users/UserListProvider"
import { Text } from "@radix-ui/themes"

export const AddRavenUsersButton = ({ isOpen, onClose }: any) => {


    return <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
        <AddRavenUsersModal onClose={onClose} />
    </Modal>

}

interface ChannelModalProps {
    onClose: () => void
}

export const AddRavenUsersModal = ({ onClose }: ChannelModalProps) => {

    const { mutate } = useSWRConfig()
    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const filters: Filter[] = [['enabled', '=', 1], ['name', 'not in', ['Guest', 'Administrator']], ['user_type', '!=', 'Website User'], ['full_name', 'like', `%${debouncedText}%`]]

    const { start, count, selectedPageLength, setPageLength, nextPage, previousPage } = usePaginationWithDoctype("User", 10, filters)
    const [sortOrder, setSortOder] = useState<"asc" | "desc">("desc")
    const [sortByField, setSortByField] = useState<string>('creation')

    const { data, error } = useFrappeGetDocList<User>("User", {
        fields: ["name", "full_name", "user_image", "creation", "enabled", "user_type"],
        filters,
        orderBy: {
            field: sortByField,
            order: sortOrder
        },
        limit_start: start > 0 ? (start - 1) : 0,
        limit: selectedPageLength
    })

    const users = useContext(UserListContext)
    const ravenUsersArray = users.users.map(user => user.name)

    const [selected, setSelected] = useState<string[]>([])
    const { createDoc, loading } = useFrappeCreateDoc()
    const toast = useToast()

    const handleAddUsers = async () => {
        if (selected.length > 0) {

            const createPromises = selected.map(user => createDoc('Raven User', { user: user }))

            Promise.all(createPromises)
                .then(() => {
                    toast({
                        title: 'Users added',
                        description: 'Users have been added to Raven',
                        status: 'success',
                        duration: 3000,
                        isClosable: true
                    })
                    onClose()
                    mutate('raven.api.raven_users.get_list')
                })
                .catch(err => {
                    toast({
                        title: 'Error',
                        description: err.message,
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                    })
                })
        }
    }

    return (
        <ModalContent>
            <ModalHeader>Add users to Raven</ModalHeader>
            <ModalCloseButton />

            <ModalBody>

                <Stack spacing={4}>
                    <HStack justifyContent='space-between'>
                        <HStack>
                            <InputGroup size='sm' width='300px'>
                                <InputLeftElement
                                    pointerEvents='none'
                                    children={<SearchIcon color='gray.300' />} />
                                <Input
                                    onChange={handleChange}
                                    type='text'
                                    placeholder='Search for user' />
                            </InputGroup>
                            {debouncedText.length > 0 && debouncedText.length < 2 && <Text size='1' color="gray">Continue typing...</Text>}
                        </HStack>
                        <HStack justify='flex-end'>
                            <Sort
                                sortingFields={[{ label: 'Created on', field: 'creation' }]}
                                onSortFieldSelect={(selField) => setSortByField(selField)}
                                sortOrder={sortOrder}
                                sortField={sortByField}
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
                        </HStack>
                    </HStack>

                    <ErrorBanner error={error} />

                    {!data && !error && <TableLoader columns={10} />}

                    {data && data.length === 0 && debouncedText.length >= 2 &&
                        <Center h='400px'>
                            <Text size='2' align='center'>No results found</Text>
                        </Center>}

                    {data && data.length !== 0 && <UsersTable data={data} defaultSelected={ravenUsersArray} selected={selected} setSelected={setSelected} />}

                </Stack>

            </ModalBody>

            <ModalFooter>
                <ButtonGroup>
                    <Button variant='ghost' onClick={onClose} isDisabled={loading}>Cancel</Button>
                    <Button colorScheme='blue' onClick={handleAddUsers} isLoading={loading}>Add users</Button>
                </ButtonGroup>
            </ModalFooter>
        </ModalContent>
    )
}