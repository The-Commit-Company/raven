import { useState, useCallback } from 'react';

export interface DoctypePaginationHookReturnType extends PaginationHookReturnType {
    count: number | undefined;
    error: any;
    mutate: VoidFunction;
}

export interface PaginationHookReturnType {
    start: number;
    selectedPageLength: number;
    setPageLength: (value: number) => void;
    nextPage: VoidFunction;
    previousPage: VoidFunction;
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
}

/**
 * Core pagination hook with optimized state management
 * @param initPageLength Initial number of items per page
 * @param totalRows Total number of items to paginate
 * @returns Pagination state and controls
 */
export const usePagination = (initPageLength: number, totalRows: number = 0): PaginationHookReturnType => {
    const [selectedPageLength, setSelectedPageLength] = useState<number>(initPageLength);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Memoized calculations
    const totalPages = Math.ceil(totalRows / selectedPageLength);
    const start = totalRows ? (currentPage - 1) * selectedPageLength + 1 : 0;

    // Memoized handlers
    const setPageLength = useCallback((value: number) => {
        setSelectedPageLength(value);
        setCurrentPage(1); // Reset to first page when changing page length
    }, []);

    const nextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const previousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const goToPage = useCallback((page: number) => {
        const targetPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(targetPage);
    }, [totalPages]);

    return {
        start,
        selectedPageLength,
        setPageLength,
        nextPage,
        previousPage,
        currentPage,
        totalPages,
        goToPage
    };
};