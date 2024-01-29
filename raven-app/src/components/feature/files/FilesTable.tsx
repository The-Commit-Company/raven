import { StandardDate } from "@/utils/dateConversions"
import { Table } from "@radix-ui/themes"
import { BsThreeDots } from "react-icons/bs"

type File = {
    name: string,
    file: string,
    file_thumbnail: string,
    owner: string,
    creation: string,
    message_type: 'Image' | 'File',
    channel_id: string,
}

export const FilesTable = ({ data }: { data: any }) => {
    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Shared on</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Sent by</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((file: File, index: number) => {
                    return (
                        <Table.Row key={index}>
                            <Table.Cell>{file.message_type}</Table.Cell>
                            <Table.Cell>{file.file}</Table.Cell>
                            <Table.Cell><StandardDate date={file.creation} /></Table.Cell>
                            <Table.Cell>{file.owner ?? '-'}</Table.Cell>
                            <Table.Cell>
                                <BsThreeDots />
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table.Root>
    )
}