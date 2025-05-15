import AINotEnabledCallout from '@/components/feature/settings/ai/AINotEnabledCallout'
import FileSourceUploadDialog from '@/components/feature/settings/ai/file-sources/FileSourceUploadDialog'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenAIFileSource } from '@/types/RavenAI/RavenAIFileSource'
import { getTimePassed } from '@/utils/dateConversions'
import { hasRavenAdminRole, isSystemManager } from '@/utils/roles'
import { AlertDialog, Badge, Button, IconButton, Link as RadixLink, Spinner, Table, Text } from '@radix-ui/themes'
import { useFrappeDeleteDoc, useFrappeGetDocList } from 'frappe-react-sdk'
import { useState } from 'react'
import { BiFile } from 'react-icons/bi'
import { FiTrash2 } from 'react-icons/fi'

type Props = {}

const FileSourcesList = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole() || isSystemManager()

    const { data, isLoading, error, mutate } = useFrappeGetDocList<RavenAIFileSource>("Raven AI File Source", {
        fields: ["name", "file_name", "file", "file_type", "creation"],
        orderBy: {
            field: "modified",
            order: "desc"
        }
    }, isRavenAdmin ? undefined : null, {
        errorRetryCount: 2
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='File Sources'
                    description='Add files that can be used by AI Agents.'
                    actions={isRavenAdmin ? <FileSourceUploadDialog onUpload={() => mutate()} /> : undefined}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                <AINotEnabledCallout />
                {data && data.length > 0 && <FileSourceTable data={data} mutate={mutate} />}
                {(data?.length === 0 || !isRavenAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <BiFile />
                    </EmptyStateIcon>
                    <EmptyStateTitle>File Sources</EmptyStateTitle>
                    <EmptyStateDescription>
                        AI Agents can use files as data sources to get more context, read instructions and execute tasks.
                        You can upload files here and use them across multiple agents.
                    </EmptyStateDescription>
                    {isRavenAdmin && <Button asChild className='not-cal'>
                        Upload a file
                    </Button>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

const FileSourceTable = ({ data, mutate }: { data: RavenAIFileSource[], mutate: () => void }) => {

    const [selected, setSelected] = useState<RavenAIFileSource | undefined>()

    const { deleteDoc, loading: deleteLoading, error: deleteError } = useFrappeDeleteDoc()

    const onDelete = () => {
        if (!selected) return
        deleteDoc("Raven AI File Source", selected.name).then(() => {
            setSelected(undefined)
            mutate()
        })
    }

    const onOpenChange = (open: boolean) => {
        if (!open) setSelected(undefined)
    }

    return (
        <>
            <Table.Root variant="surface" className='rounded-sm animate-fadein'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Uploaded</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data?.map((d) => (
                        <Table.Row key={d.name} className='hover:bg-gray-2 dark:hover:bg-gray-3'>
                            <Table.Cell maxWidth={"250px"}>
                                <RadixLink href={d.file} target='_blank' color='gray' underline='always' className='text-gray-12'>
                                    {d.file_name}
                                </RadixLink>
                            </Table.Cell>
                            <Table.Cell maxWidth={"250px"}>
                                <Badge color='gray' className='uppercase'>{d.file_type}</Badge>
                            </Table.Cell>
                            <Table.Cell maxWidth={"250px"}>
                                <Text className='line-clamp-1 text-ellipsis'>{getTimePassed(d.creation)}</Text>
                            </Table.Cell>
                            <Table.Cell maxWidth={"80px"} align='right'>
                                <IconButton onClick={() => setSelected(d)} color='red' variant='soft' size='1' className='not-cal' title='Delete' aria-label='Delete'>
                                    <FiTrash2 />
                                </IconButton>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            <AlertDialog.Root open={!!selected} onOpenChange={onOpenChange}>
                <AlertDialog.Content>
                    <AlertDialog.Title>Delete File?</AlertDialog.Title>
                    <AlertDialog.Description>
                        Are you sure you want to delete the file <strong>{selected?.file_name}</strong>?
                    </AlertDialog.Description>
                    <Stack gap='2' pt='4'>
                        {deleteError && <ErrorBanner error={deleteError} />}
                        <HStack justify='end' gap='2' pt='2'>
                            <AlertDialog.Cancel>
                                <Button variant='soft' color='gray' className='not-cal'>
                                    Cancel
                                </Button>
                            </AlertDialog.Cancel>
                            <Button color='red' className='not-cal' onClick={onDelete} disabled={deleteLoading}>
                                {deleteLoading ? <Spinner /> : 'Delete'}
                            </Button>
                        </HStack>
                    </Stack>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    )
}

export const Component = FileSourcesList