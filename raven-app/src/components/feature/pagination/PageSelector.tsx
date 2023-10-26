import { HStack, IconButton, Text } from '@chakra-ui/react'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'

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
        <HStack>
            <IconButton aria-label="go to previous page"
                size='xs'
                variant='ghost'
                rounded='full'
                icon={<BsChevronLeft />}
                onClick={gotoPreviousPage}
                isDisabled={(start <= 1)} />

            <Text fontSize='xs' fontWeight='light'>
                {start} - {end} of {totalRows}
            </Text>

            <IconButton aria-label="go to next page"
                size='xs'
                variant='ghost'
                rounded='full'
                icon={<BsChevronRight />}
                onClick={gotoNextPage}
                isDisabled={(end === totalRows)} />
        </HStack>
    )
}