import { Skeleton } from "@/components/common/Skeleton"
import { Table } from "@radix-ui/themes"
import { TableRootProps } from "@radix-ui/themes/dist/cjs/components/table"


interface Props extends TableRootProps {
    rows?: number,
    columns?: number,
}

export const TableLoader = ({ rows = 10, columns = 5, color = "gray", ...props }: Props) => {

    return (
        <Table.Root {...props}>
            <Table.Body>
                {
                    [...Array(rows)].map((e, index) =>
                        <Table.Row key={index}>
                            {[...Array(columns)].map((e, i) =>
                                <Table.Cell key={i}><Skeleton width='100%' height='4' /></Table.Cell>
                            )}
                        </Table.Row>
                    )
                }
            </Table.Body>
        </Table.Root>
    )
}
