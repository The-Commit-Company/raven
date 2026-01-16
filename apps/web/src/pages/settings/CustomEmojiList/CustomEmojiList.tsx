import { useState } from 'react'
import { DataTable } from '@components/common/DataTable/DataTable'
import { useFetchCustomEmojis } from '@hooks/fetchers/useFetchCustomEmojis'
import { ColumnDef, PaginationState, SortingState } from 'src/types/DataTable'
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
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
        totalCount: 0
    })
    // State for the add custom emoji dialog
    const [open, setOpen] = useState(false)

    const { data, isLoading, error, mutate } = useFetchCustomEmojis(sorting ?? undefined, pagination)

    const onAddEmoji = (refresh: boolean = false) => {
        if (refresh) {
            mutate()
            globalMutate('custom-emojis')
        }
        setOpen(false)

    }

    const onDeleteEmoji = () => {
        mutate()
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
            {data && data.length > 0 ? (
                <DataTable
                    columns={customEmojiColumns}
                    data={data ?? []}
                    isLoading={isLoading}
                    error={error}
                    getRowId={(row) => row.name}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            ) : (
                <CustomEmojiEmptyState setOpen={setOpen} />
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
