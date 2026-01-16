import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table"
import { Skeleton } from "@components/ui/skeleton"
import ErrorBanner from "@components/ui/error-banner"
import { cn } from "@lib/utils"
import { ArrowUpIcon, ArrowDownIcon, ChevronsUpDownIcon } from "lucide-react"
import type { DataTableProps, ColumnDef, CellContext, HeaderContext, SortingState } from "../../../types/DataTable"
import { Button } from "@components/ui/button"

/**
 * A reusable DataTable component for displaying tabular data.
 *
 * This is a basic building block that renders columns and rows based on
 * the provided column definitions and data array.
 *
 * @template TData - The type of data object in each row
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   { id: 'name', accessorKey: 'full_name', header: 'Name' },
 *   { id: 'email', accessorKey: 'email', header: 'Email' },
 * ]
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   isLoading={isLoading}
 *   getRowId={(row) => row.name}
 * />
 * ```
 */
export function DataTable<TData>({
    columns,
    data,
    isLoading = false,
    error = null,
    getRowId,
    emptyState,
    className,
    tableClassName,
    // Sorting props
    sorting = null,
    onSortingChange,
}: DataTableProps<TData>) {

    /**
     * Checks if a column is sortable.
     * A column is sortable if:
     * - enableSorting is explicitly true, OR
     * - enableSorting is undefined AND accessorKey is provided (default behavior)
     */
    const isColumnSortable = (column: ColumnDef<TData>): boolean => {
        if (column.enableSorting !== undefined) {
            return column.enableSorting
        }
        // Default: sortable if it has an accessorKey (maps to a real field)
        return column.accessorKey !== undefined
    }

    /**
     * Gets the current sort direction for a column.
     * Returns null if the column is not currently sorted.
     */
    const getColumnSortDirection = (column: ColumnDef<TData>): "asc" | "desc" | null => {
        if (!sorting) return null
        // Match by accessorKey (the field name) since that's what we sort by
        const sortField = column.accessorKey as string
        if (sorting.field === sortField) {
            return sorting.order
        }
        return null
    }

    /**
     * Handles click on a sortable column header.
     * Cycles through: asc -> desc -> no sort
     */
    const handleSortClick = (column: ColumnDef<TData>) => {
        if (!onSortingChange || !isColumnSortable(column)) return

        const field = column.accessorKey as string
        const currentDirection = getColumnSortDirection(column)

        let newSorting: SortingState | null
        if (currentDirection === null) {
            // Not sorted: start with ascending
            newSorting = { field, order: "asc" }
        } else if (currentDirection === "asc") {
            // Ascending: switch to descending
            newSorting = { field, order: "desc" }
        } else {
            // Descending: clear sort
            newSorting = null
        }

        onSortingChange(newSorting)
    }

    /**
     * Renders the sort indicator icon for a column.
     */
    const renderSortIcon = (column: ColumnDef<TData>) => {
        const direction = getColumnSortDirection(column)

        if (direction === "asc") {
            return <ArrowUpIcon className="ml-2 h-4 w-4" />
        }
        if (direction === "desc") {
            return <ArrowDownIcon className="ml-2 h-4 w-4" />
        }
        // No active sort: show neutral icon (only if sortable)
        return <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
    }

    /**
     * Renders the header content for a column.
     * Supports both string headers and custom render functions.
     * Adds sorting functionality if the column is sortable.
     */
    const renderHeader = (column: ColumnDef<TData>) => {
        // Get the base header content
        let headerContent: React.ReactNode
        if (typeof column.header === 'function') {
            const context: HeaderContext<TData> = { column }
            headerContent = column.header(context)
        } else {
            headerContent = column.header
        }

        // If column is sortable and we have a sort handler, wrap in clickable element
        const sortable = isColumnSortable(column) && onSortingChange

        if (sortable) {
            return (
                <Button
                    className="flex items-center hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded"
                    onClick={() => handleSortClick(column)}
                    variant="ghost"
                    size="sm"
                >
                    {headerContent}
                    {renderSortIcon(column)}
                </Button>
            )
        }

        return headerContent
    }

    /**
     * Gets the cell value from a row using the column's accessorKey.
     * Uses type assertion since accessorKey is constrained to keyof TData.
     */
    const getCellValue = (row: TData, column: ColumnDef<TData>): unknown => {
        if (column.accessorKey) {
            // Type-safe access: accessorKey is keyof TData
            return (row as Record<string, unknown>)[column.accessorKey as string]
        }
        return undefined
    }

    /**
     * Renders the cell content for a column.
     * Uses custom cell renderer if provided, otherwise displays raw value.
     */
    const renderCell = (row: TData, column: ColumnDef<TData>, rowIndex: number) => {
        const value = getCellValue(row, column)

        if (column.cell) {
            const context: CellContext<TData> = {
                row,
                value,
                column,
                rowIndex,
            }
            return column.cell(context)
        }

        // Default: render the value as string (handles null/undefined gracefully)
        return value != null ? String(value) : ''
    }

    /**
     * Gets the unique key for a row.
     * Uses getRowId if provided, otherwise falls back to index.
     */
    const getRowKey = (row: TData, index: number): string => {
        if (getRowId) {
            return getRowId(row)
        }
        return String(index)
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Error Banner - displayed above the table when there's an error */}
            {error && <ErrorBanner error={error} />}

            {/* Loading State - skeleton rows */}
            {isLoading && !error && (
                <DataTableSkeleton columns={columns.length} rows={5} />
            )}

            {/* Table Content */}
            {!isLoading && !error && (
                <div className="overflow-hidden rounded-md border">
                    <Table className={tableClassName}>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column: ColumnDef<TData>) => (
                                    <TableHead
                                        key={column.id}
                                        className={column.headerClassName}
                                    >
                                        {renderHeader(column)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((row: TData, rowIndex: number) => (
                                    <TableRow key={getRowKey(row, rowIndex)}>
                                        {columns.map((column: ColumnDef<TData>) => (
                                            <TableCell
                                                key={column.id}
                                                className={column.cellClassName}
                                            >
                                                {renderCell(row, column, rowIndex)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                // Empty state when no data
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        {emptyState ?? (
                                            <span className="text-muted-foreground">
                                                No data available.
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

/**
 * Loading skeleton for the DataTable.
 * Displays animated placeholder rows while data is being fetched.
 */
interface DataTableSkeletonProps {
    /** Number of columns to display */
    columns: number
    /** Number of skeleton rows to display */
    rows?: number
}

function DataTableSkeleton({ columns, rows = 5 }: DataTableSkeletonProps) {
    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export { DataTableSkeleton }
