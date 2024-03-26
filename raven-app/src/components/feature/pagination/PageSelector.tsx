import { Flex, Text, IconButton } from '@radix-ui/themes'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'

interface Props {
    start: number,
    rowsPerPage: number,
    totalRows: number,
    gotoPreviousPage: VoidFunction,
    gotoNextPage: VoidFunction,
}

/**
 * The component takes starting row index, rows per page and total rows to be displayed
 * It returns a callback for going to previous or next page depending on the button clicked
 */
export const PageSelector = ({ start, rowsPerPage, totalRows, gotoPreviousPage, gotoNextPage }: Props) => {

    const end = Math.min(start + rowsPerPage - 1, totalRows)

    // If previous page is not avaialbe or next page is not available then disable
    // the previous or next page button accordingly
    return (
        <Flex gap='2'>
            <IconButton
                aria-label="go to previous page"
                size='1'
                color='gray'
                variant='ghost'
                onClick={gotoPreviousPage}
                disabled={(start <= 1)}
            >
                <BiChevronLeft />
            </IconButton>

            <Text size='1' weight='light' as='span'>
                {start} - {end} of {totalRows}
            </Text>

            <IconButton
                aria-label="go to next page"
                size='1'
                variant='ghost'
                color='gray'
                onClick={gotoNextPage}
                disabled={(end === totalRows)}
            >
                <BiChevronRight />
            </IconButton>
        </Flex>
    )
}