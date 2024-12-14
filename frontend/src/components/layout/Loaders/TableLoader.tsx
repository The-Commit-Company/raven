import { Skeleton } from "@/components/common/Skeleton"
import { Table } from "@radix-ui/themes"


interface Props {
    rows?: number,
    columns?: number,
    color?: string
}

export const TableLoader = ({ rows = 10, columns = 5, color = "gray", ...props }: Props) => {

    return (
        <Table.Root variant="surface" {...props} className='rounded-sm animate-fadeinSlow delay-1000'>
            <Table.Header>
                <Table.Row>
                    {[...Array(columns)].map((e, i) => <Table.ColumnHeaderCell key={i}><Skeleton width='100%' height='16px' /></Table.ColumnHeaderCell>)}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    [...Array(rows)].map((e, index) =>
                        <Table.Row key={index}>
                            {[...Array(columns)].map((e, i) =>
                                <Table.Cell key={i}><Skeleton width='100%' height='16px' /></Table.Cell>
                            )}
                        </Table.Row>
                    )
                }
            </Table.Body>
        </Table.Root>
    )
}
