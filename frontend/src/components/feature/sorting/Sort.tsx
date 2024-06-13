import { IconButton } from "@radix-ui/themes"
import { BiDownArrowAlt, BiUpArrowAlt } from "react-icons/bi"

export interface SortProps {
    sortOrder: string,
    onSortOrderChange: (order: "asc" | "desc") => void,
}

/**
 * Sorting component with sort order toggle & sort by field functionality.
 * @param sortingFields array of custom 'Sort by' fields & respective labels. Type - SortFields[]
 * @param onSortFieldSelect callback for returning selected field.
 * @param sortOrder ascending or descending order of sorting.
 * @param onSortOrderChange callback to toggle sort order.
 * @returns fields & callbacks to control sorting.
 */
export const Sort = ({ sortOrder, onSortOrderChange }: SortProps) => {

    const handleSortOrder = () => {
        sortOrder === "asc" ? onSortOrderChange("desc") : onSortOrderChange("asc")
    }

    return (
        <IconButton
            size='1'
            color='gray'
            variant="soft"
            title={sortOrder === "asc" ? "newest first" : "oldest first"}
            onClick={handleSortOrder}
            aria-label={sortOrder === "asc" ? "click to sort by newest first" : "click to sort by oldest first"}>
            {sortOrder === "asc" ? <BiUpArrowAlt /> : <BiDownArrowAlt />}
        </IconButton>
    )
}