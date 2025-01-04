import AddCustomEmojiDialog from '@/components/common/EmojiPicker/AddCustomEmojiDialog'
import DeleteCustomEmojiDialog from '@/components/common/EmojiPicker/DeleteCustomEmojiDialog'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack } from '@/components/layout/Stack'
import { RavenCustomEmoji } from '@/types/RavenMessaging/RavenCustomEmoji'
import { getDateObject } from '@/utils/dateConversions/utils'
import { Button, Table, Text, Link } from '@radix-ui/themes'
import { useFrappeGetDocList, useSWRConfig } from 'frappe-react-sdk'
import { useState } from 'react'
import { LuSmilePlus } from 'react-icons/lu'

const CustomEmojiList = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const { data, isLoading, error, mutate } = useFrappeGetDocList<RavenCustomEmoji>("Raven Custom Emoji", {
        fields: ["name", "emoji_name", "image", "keywords", "owner", "creation"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    }, undefined, {
        errorRetryCount: 2
    })

    const [open, setOpen] = useState(false)

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
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Emojis'
                    description={<>Add custom emojis to use for your reactions. PNG, SVG and GIFs supported. <br />Need help finding one? Download from <Link href='https://emoji.gg' target='_blank'>Emoji.gg</Link>.</>}
                    actions={<Button onClick={() => setOpen(true)}>
                        Upload
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                {data && data.length > 0 && <CustomEmojisTable emojis={data} onDelete={onDeleteEmoji} />}
                {data?.length === 0 && <EmptyState>
                    <EmptyStateIcon>
                        <LuSmilePlus />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Emojis</EmptyStateTitle>
                    <EmptyStateDescription>
                        Personalize your chats with custom emojis.
                        <br />
                        Upload your own or download from <Link href='https://emoji.gg' target='_blank'>Emoji.gg</Link>.
                    </EmptyStateDescription>
                    <Button className='not-cal' onClick={() => setOpen(true)}>
                        Upload
                    </Button>
                </EmptyState>}
                <AddCustomEmojiDialog open={open} onClose={onAddEmoji} />
            </SettingsContentContainer>
        </PageContainer>
    )
}

const CustomEmojisTable = ({ emojis, onDelete }: { emojis: RavenCustomEmoji[], onDelete: () => void }) => {
    return (
        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Keywords</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Uploaded By</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Added</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {emojis?.map((emoji) => (
                    <Table.Row key={emoji.name} className='hover:bg-gray-1 dark:hover:bg-gray-1 group'>
                        <Table.Cell>
                            <HStack align='center' gap='2'>
                                <img src={emoji.image} alt={emoji.emoji_name} className='h-8 w-8 object-contain object-center' />
                                <Text weight='medium'>:{emoji.emoji_name}:</Text>
                            </HStack>
                        </Table.Cell>
                        <Table.Cell align='center'>
                            <Text className='flex h-full items-center'>{emoji.keywords}</Text>
                        </Table.Cell>
                        <Table.Cell align='center'>
                            <Text className='flex h-full items-center'>{emoji.owner}</Text>
                        </Table.Cell>
                        <Table.Cell align='center'>
                            <Text className='flex h-full items-center'>{getDateObject(emoji.creation).format("MMM Do, YYYY")}</Text>
                        </Table.Cell>
                        <Table.Cell align='center'>
                            <DeleteCustomEmojiDialog emojiID={emoji.name} onDelete={onDelete} />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}
export const Component = CustomEmojiList