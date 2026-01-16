import { useState } from 'react'
import { DataTable } from '@components/common/DataTable/DataTable'
import { useFetchCustomEmojis, useFetchCustomEmojisCount } from '@hooks/fetchers/useFetchCustomEmojis'
import { ColumnDef, SortingState } from 'src/types/DataTable'
import { useSWRConfig } from 'frappe-react-sdk'
import SettingsContentContainer from '@components/features/settings/SettingsContentContainer'
import { Button } from '@components/ui/button'
import { Link } from 'react-router-dom'
import { RavenCustomEmoji } from '@raven/types/RavenMessaging/RavenCustomEmoji'
import { getDateObject } from '@utils/date'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@components/features/settings/EmptyDataTableState'
import { SmilePlus } from 'lucide-react'
import AddCustomEmojiDialog from '@pages/settings/CustomEmojiList/AddEmojiDialog'

const CustomEmojiEmptyState = ({ setOpen }: { setOpen: (open: boolean) => void }) => {

    return (
        <EmptyState>
            <div className='flex flex-col items-center justify-center'>
                <EmptyStateIcon>
                    <SmilePlus />
                </EmptyStateIcon>
                <EmptyStateTitle>Emojis</EmptyStateTitle>
            </div>

            <EmptyStateDescription>
                Personalize your chats with custom emojis.
                <br />
                Upload your own or download from <Link to='https://emoji.gg' target='_blank' className='text-primary underline'>Emoji.gg</Link>.
            </EmptyStateDescription>
            <Button size='sm' onClick={() => setOpen(true)}>
                Upload
            </Button>
        </EmptyState>
    )
}

const CustomEmojiList = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const [sorting, setSorting] = useState<SortingState | null>(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const [open, setOpen] = useState(false)

    // Fetch data with current page settings
    const { data, isLoading, error, mutate } = useFetchCustomEmojis(
        sorting ?? undefined,
        { pageIndex, pageSize, totalCount: 0 }
    )
    const { count, mutate: mutateCount } = useFetchCustomEmojisCount()

    const pagination = { pageIndex, pageSize, totalCount: count }

    const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number; totalCount: number }) => {
        setPageIndex(newPagination.pageIndex)
        setPageSize(newPagination.pageSize)
    }

    const onAddEmoji = (refresh: boolean = false) => {
        if (refresh) {
            mutate()
            mutateCount()
            globalMutate('custom-emojis')
        }
        setOpen(false)
    }

    const onDeleteEmoji = () => {
        mutate()
        mutateCount()
        globalMutate('custom-emojis')
    }


    return (
        <SettingsContentContainer
            title="Emojis"
            description={
                <>
                    Add custom emojis to use for your reactions. PNG, SVG and GIFs supported.
                    <br />Need help finding one? Download from <Link to='https://emoji.gg' target='_blank' className='text-primary underline'>Emoji.gg</Link>.
                </>
            }
            actions={
                <Button
                    size='sm'
                    onClick={() => setOpen(true)}>
                    Upload
                </Button>
            }
        >
            {/* Show empty state only when not loading and count is 0 */}
            {!isLoading && count === 0 ? (
                <CustomEmojiEmptyState setOpen={setOpen} />
            ) : (
                <DataTable
                    columns={customEmojiColumns}
                    data={data ?? []}
                    isLoading={isLoading}
                    error={error}
                    getRowId={(row) => row.name}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    pagination={pagination}
                        onPaginationChange={handlePaginationChange}
                    />
            )}
            <AddCustomEmojiDialog open={open} onClose={onAddEmoji} />
        </SettingsContentContainer>
    )
}

const customEmojiColumns: ColumnDef<RavenCustomEmoji>[] = [
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        enableSorting: true,
        cell: ({ row }: { row: RavenCustomEmoji }) => {
            return (
                <div className='flex items-center gap-2'>
                    <img src={row.image} alt={row.emoji_name} className='w-8 h-8 rounded-md object-contain object-center' />
                    <p className='text-sm font-medium'>:{row.emoji_name}:</p>
                </div>
            )
        }
    },
    {
        id: 'keywords',
        header: 'Keywords',
        accessorKey: 'keywords'
    },
    {
        id: 'owner',
        header: 'Uploaded By',
        accessorKey: 'owner'
    },
    {
        id: 'creation',
        header: 'Added',
        accessorKey: 'creation',
        enableSorting: true,
        cell: ({ row }) => {
            return (
                <p className='text-sm font-medium'>{getDateObject(row.creation).format("MMM Do, YYYY")}</p>
            )
        }
    }
]


export default CustomEmojiList
