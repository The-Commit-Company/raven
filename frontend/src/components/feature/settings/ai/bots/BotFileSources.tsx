import { Label } from '@/components/common/Form'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Badge, Button, Checkbox, Dialog, IconButton, Link as RadixLink, Table, Text } from '@radix-ui/themes'
import { useFieldArray, useFormContext } from 'react-hook-form'
import FileSourceUploadDialog from '../file-sources/FileSourceUploadDialog'
import { FiTrash2 } from 'react-icons/fi'
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { useState } from 'react'

type Props = {}

const BotFileSources = (props: Props) => {

    const { control } = useFormContext<RavenBot>()

    const { fields, append, remove } = useFieldArray({
        control,
        name: "file_sources"
    })

    const addNew = (id: string) => {
        append({
            file: id,
            name: "",
            creation: "",
            modified: "",
            owner: "",
            docstatus: 0,
            modified_by: ""
        })
    }

    return (
        <Stack>
            <HStack justify='between' align='center'>
                <Text>Files like manuals, sheets etc can be added to the AI agent as instructions.</Text>
                <HStack gap='2'>
                    <FileSourceUploadDialog
                        buttonProps={{ variant: "soft", className: "not-cal" }}
                        onUpload={addNew} />

                    <Dialog.Root>
                        <Dialog.Trigger>
                            <Button className='not-cal' type='button'>Select Files</Button>
                        </Dialog.Trigger>
                        <Dialog.Content>
                            <Dialog.Title>Select Files</Dialog.Title>
                            <Dialog.Description size='2'>
                                Select files from the list below.
                            </Dialog.Description>
                            <div className='mt-4'>
                                <SelectExistingFiles append={addNew} existingFiles={fields.map((d) => d.file)} />
                            </div>
                        </Dialog.Content>
                    </Dialog.Root>
                </HStack>
            </HStack>

            <Table.Root variant="surface" className='rounded-sm animate-fadein'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {fields?.map((d, index) => (
                        <FileSourceRow key={d.name} fileID={d.file} onDelete={() => remove(index)} />
                    ))}
                </Table.Body>
            </Table.Root>
        </Stack>
    )
}

const FileSourceRow = ({ fileID, onDelete }: { fileID: string, onDelete: () => void }) => {

    const { data } = useFrappeGetCall('frappe.client.get_value', {
        doctype: "Raven AI File Source",
        filters: fileID,
        fieldname: JSON.stringify(["file_name", "file_type", "file"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const file = data?.message


    return <Table.Row className='hover:bg-gray-2 dark:hover:bg-gray-3'>
        <Table.Cell maxWidth={"250px"}>
            <RadixLink href={file?.file} target='_blank' color='gray' underline='always' className='text-gray-12'>
                {file?.file_name}
            </RadixLink>
        </Table.Cell>
        <Table.Cell maxWidth={"250px"}>
            <Badge color='gray' className='uppercase'>{file?.file_type}</Badge>
        </Table.Cell>
        <Table.Cell maxWidth={"80px"} align='right'>
            <IconButton onClick={onDelete} type='button' color='red' variant='soft' size='1' className='not-cal' title='Delete' aria-label='Delete'>
                <FiTrash2 />
            </IconButton>
        </Table.Cell>
    </Table.Row>
}

const SelectExistingFiles = ({ append, existingFiles }: { append: (id: string) => void, existingFiles: string[] }) => {

    const [selectedFiles, setSelectedFiles] = useState<string[]>([])

    const onSelect = (id: string) => {
        setSelectedFiles((prev) => {
            if (prev.includes(id)) {
                return prev.filter((d) => d !== id)
            }
            return [...prev, id]
        })
    }

    const onSubmit = () => {
        selectedFiles.forEach((d) => append(d))
        setSelectedFiles([])
    }

    const { data, isLoading, error } = useFrappeGetDocList('Raven AI File Source', {
        fields: ["name", "file_name", "file_type", "file"]
    }, undefined, {
        revalidateOnFocus: false
    })

    return <Stack>
        {isLoading && <TableLoader columns={2} />}
        {error && <ErrorBanner error={error} />}

        <Table.Root variant="surface" className='rounded-sm animate-fadein'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>

                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((d) => {
                    if (existingFiles.includes(d.name)) return null
                    return <Table.Row key={d.name} className='hover:bg-gray-2 dark:hover:bg-gray-3'>
                        <Table.Cell maxWidth={"300px"}>
                            <Label htmlFor={d.name}>
                                <HStack align='center'>
                                    <Checkbox id={d.name} checked={selectedFiles.includes(d.name)} onCheckedChange={(checked) => onSelect(d.name)} />
                                    <Text as='span' size='2' className='text-ellipsis overflow-hidden whitespace-nowrap'>{d.file_name}</Text>
                                </HStack>
                            </Label>
                        </Table.Cell>
                        <Table.Cell maxWidth={"250px"}><Badge color='gray' className='uppercase'>{d.file_type}</Badge></Table.Cell>
                    </Table.Row>
                })}
            </Table.Body>
        </Table.Root>

        <HStack justify='end' gap='2' pt='4'>
            <Dialog.Close>
                <Button variant='soft' color='gray' type='button' className='not-cal'>Close</Button>
            </Dialog.Close>
            <Dialog.Close onClick={onSubmit} disabled={selectedFiles.length === 0}>
                <Button type='button' className='not-cal'>Add</Button>
            </Dialog.Close>
        </HStack>
    </Stack>

}

export default BotFileSources