import { Table, Tr, Td, Skeleton, TableProps, Tbody } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props extends TableProps {
    rows?: number,
    columns?: number,
    speed?: number,
    color?: string,
    width?: string,
    height?: string
}

export const TableLoader = ({ rows = 10, columns = 5, color = "gray", speed = 1, width = "28", height = "4", ...props }: Props) => {

    return (
        <Table size="sm" {...props} as={motion.table} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Tbody>
                <AnimatePresence>
                    {
                        [...Array(rows)].map((e, index) =>
                            <Tr key={index} as={motion.tr} initial={{ y: 10 }} animate={{ y: 0 }} exit={{ y: -10 }}>
                                {[...Array(columns)].map((e, i) =>
                                    <Td key={i} py="3"><Skeleton height={height} width={width} speed={speed} colorScheme={color} /></Td>
                                )}
                            </Tr>
                        )
                    }
                </AnimatePresence>
            </Tbody>
        </Table>
    )
}
