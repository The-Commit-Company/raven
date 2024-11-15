import { useDebounce } from '@/hooks/useDebounce'
import { usePaginationWithDoctype } from '@/hooks/usePagination'
import { isSystemManager } from '@/utils/roles'
import { Box, Button, Card, Container, Flex, Heading, Link, Strong, Text, TextField } from '@radix-ui/themes'
import { clsx } from 'clsx'
import { Filter, useFrappeGetDocList, useFrappePostCall } from 'frappe-react-sdk'
import { ChangeEvent, useContext, useState } from 'react'
import { FaInfo } from 'react-icons/fa'
import { PageLengthSelector } from '@/components/feature/pagination/PageLengthSelector'
import { PageSelector } from '@/components/feature/pagination/PageSelector'
import { Sort } from '@/components/feature/sorting/Sort'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import { BiLeftArrowAlt, BiSearch } from 'react-icons/bi'
import { UserContext } from '@/utils/auth/UserProvider'
import { Loader } from '@/components/common/Loader'
import { toast } from 'sonner'
import { User } from '@/types/Core/User'
import { UsersTable } from '@/components/feature/userSettings/Users/UsersTable'

const AddRavenUsersPage = () => {

    const canAddRavenUsers = isSystemManager()

    return (
        <Container>
            <Flex align='center' justify='center' className='h-screen'>
                {canAddRavenUsers ? <AddRavenUsersCard /> : <RavenUsersAlert />}
            </Flex>
        </Container>
    )
}

const BOX_STYLE = 'rounded-radius4'
const CARD_STYLE = 'p-4 shadow-accent-a2 shadow-lg dark:shadow-accent-a2 dark:shadow-md'

const RavenUsersAlert = () => {
    return <Box className={clsx(BOX_STYLE, 'bg-accent-a4')}>
        <Card className={clsx(CARD_STYLE, 'max-w-md')}>
            <Flex direction='column' align='center' gap='4'>
                <Box py='1'>
                    <Flex align='center' justify='center' className='text-accent-11 bg-accent-a4 rounded-full p-4'>
                        <FaInfo size={24} />
                    </Flex>
                </Box>
                <Flex direction='column' align='center' gap='2'>
                    <Heading as='h2' className='not-cal' size='4'>
                        You do not have access to <Text className='cal-sans'>Raven</Text>.
                    </Heading>
                    <Text as='p' size='2' align='center' className='leading-6'>
                        Please contact your Administrator or System Manager to give you the <Strong>"Raven User"</Strong> role.
                    </Text>
                    <Flex gap='3' direction='column' py='1' pt='3'>
                        <Button asChild>
                            <Link className='text-white' href={'/app/raven-user'}>View Raven Users</Link>
                        </Button>
                        <Button variant='outline' onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    </Box>
}


const AddRavenUsersCard = () => {
    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const filters: Filter[] = [['enabled', '=', 1], ['name', 'not in', ['Guest', 'Administrator']], ['user_type', '!=', 'Website User'], ['full_name', 'like', `%${debouncedText}%`]]

    const { start, count, selectedPageLength, setPageLength, nextPage, previousPage } = usePaginationWithDoctype("User", 10, filters)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const { data, error } = useFrappeGetDocList<User>("User", {
        fields: ["name", "full_name", "user_image", "creation", "enabled", "user_type"],
        filters,
        orderBy: {
            field: 'creation',
            order: sortOrder
        },
        limit_start: start > 0 ? (start - 1) : 0,
        limit: selectedPageLength
    })
    const { currentUser } = useContext(UserContext)

    const [selected, setSelected] = useState<string[]>([])

    const { loading, call, error: postError } = useFrappePostCall('raven.api.raven_users.add_users_to_raven')

    const handleAddUsers = () => {
        call({
            users: JSON.stringify([...selected, currentUser])
        }).then(() => {
            toast.success(`You have added ${selected.length} users to Raven`)
            window.location.reload()
        })
    }

    return <Box className={clsx(BOX_STYLE, 'bg-accent-a2')}>
        <Card className={clsx(CARD_STYLE, 'max-w-xl min-w-[720px]')}>
            <Flex gap='2' direction='column'>
                <Heading as='h1'>Add users to Raven</Heading>
                <Text as='p' size='2' className='leading-6'>
                    Users you add will be given the <Strong>"Raven User"</Strong> role.
                </Text>
            </Flex>

            <Flex direction='column' gap='4' pt='4' className='max-h-[80vh]'>
                <Flex justify='between' gap='2'>
                    <Flex gap='2' align='center'>
                        <TextField.Root style={{
                            width: '320px'
                        }}
                            onChange={handleChange}
                            value={searchText}
                            type='text'
                            placeholder='Search for user'
                        >
                            <TextField.Slot side='left'>
                                <BiSearch />
                            </TextField.Slot>
                        </TextField.Root>
                        {debouncedText.length > 0 && debouncedText.length < 2 && <Text size='1' color="gray">Continue typing...</Text>}
                    </Flex>
                    <Flex justify='end' gap='2' align='center'>
                        <Sort
                            sortOrder={sortOrder}
                            onSortOrderChange={(order) => setSortOrder(order)} />
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

                {/* <ErrorBanner error={error} /> */}
                {!data && !error && <TableLoader columns={3} />}

                {data && data.length === 0 && debouncedText.length >= 2 &&
                    <Flex align='center' justify='center' className="min-h-[32rem]">
                        <Text size='2' align='center'>No results found</Text>
                    </Flex>}

                {data && data.length !== 0 && <UsersTable data={data} defaultSelected={[currentUser]} selected={selected} setSelected={setSelected} />}

            </Flex>
            <Box pt='3'>
                <ErrorBanner error={postError} />
                <Flex align='center' gap='2' justify='between' pt='3'>
                    <Flex align='center' gap='2'>
                        <Button color='gray' variant='soft' asChild>
                            <Link href='/app' className='flex items-center'>
                                <BiLeftArrowAlt size='20' />
                                Go back to Desk
                            </Link>
                        </Button>
                    </Flex>
                    <Button type='button' disabled={loading} onClick={handleAddUsers}>
                        {loading && <Loader />}
                        {loading ? "Adding" : "Add to Raven"}
                    </Button>
                </Flex>
            </Box>

        </Card>
    </Box>
}

export default AddRavenUsersPage