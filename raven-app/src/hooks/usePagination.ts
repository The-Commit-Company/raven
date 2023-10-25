import { useFrappeGetDocCount, Filter } from "frappe-react-sdk"
import { useSearchParams } from "react-router-dom"

export interface DoctypePaginationHookReturnType extends PaginationHookReturnType {
    count: number | undefined,
    error: any,
    mutate: VoidFunction,
}

/**
 * Custom Pagination hook for 'Page Length selector' & 'Page selector'.
 * @param doctype Name of the Frappe Doctype for which total count will be returned.
 * @param pageLength default page length
 * @returns [ start, count, error, selected, setPageLength, nextPage, previousPage ]
 */
export const usePaginationWithDoctype = (doctype: string, pageLength: number, filters?: Filter[]): DoctypePaginationHookReturnType => {

    const { data: count, error, mutate } = useFrappeGetDocCount(doctype, filters)

    const paginationProps = usePagination(pageLength, count ? count : 0)

    return { count, error, mutate, ...paginationProps }
}

export interface PaginationHookReturnType {
    start: number,
    selectedPageLength: number,
    setPageLength: (value: number) => void,
    nextPage: VoidFunction,
    previousPage: VoidFunction,
}
export const usePagination = (initPageLength: number, totalRows: number = 0) => {

    let [searchParams, setSearchParams] = useSearchParams();

    const selectedPageLength = searchParams.get('count') ? parseInt(searchParams.get('count') as string) : initPageLength
    const start = Math.min(searchParams.get('start') ? parseInt(searchParams.get('start') as string) > 0 ? parseInt(searchParams.get('start') as string) : 1 : 1, totalRows)

    const setPageLength = (value: number) => {
        setSearchParams((s) => {
            const updatedSearchParams = new URLSearchParams(s.toString())
            updatedSearchParams.set('count', value.toString())
            //Update search params with new page length
            return updatedSearchParams
        })
    }

    const nextPage = () => {
        setSearchParams((s) => {
            const updatedSearchParams = new URLSearchParams(s.toString())
            const value = (start + selectedPageLength).toString()
            updatedSearchParams.set('start', value)
            //Update search params with new start value
            return updatedSearchParams
        })
    }

    const previousPage = () => {
        setSearchParams((s) => {
            const updatedSearchParams = new URLSearchParams(s.toString())
            const value = (start - selectedPageLength) > 0 ? (start - selectedPageLength).toString() : '1'
            updatedSearchParams.set('start', value)
            //Update search params with new start value
            return updatedSearchParams
        })
    }

    return { start: totalRows ? start : 0, selectedPageLength, setPageLength, nextPage, previousPage }
}