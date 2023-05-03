import { Button, ButtonGroup, IconButton, Menu, MenuButton } from "@chakra-ui/react"
import { HiSortAscending, HiSortDescending } from "react-icons/hi"
import { SortFields } from "../../../types/Sort"
import { SortMenu } from "./SortMenu"

export interface SortProps {
    sortingFields: SortFields[],
    onSortFieldSelect: (selectedField: string) => void,
    sortOrder: string,
    onSortOrderChange: (order: "asc" | "desc") => void,
    sortField: string,
}

/**
 * Sorting component with sort order toggle & sort by field functionality.
 * @param sortingFields array of custom 'Sort by' fields & respective labels. Type - SortFields[]
 * @param onSortFieldSelect callback for returning selected field.
 * @param sortOrder ascending or descending order of sorting.
 * @param onSortOrderChange callback to toggle sort order.
 * @returns fields & callbacks to control sorting.
 */
export const Sort = ({ sortingFields, onSortFieldSelect, sortOrder, onSortOrderChange, sortField }: SortProps) => {

    const handleSortOrder = () => {
        sortOrder === "asc" ? onSortOrderChange("desc") : onSortOrderChange("asc")
    }

    return (
        <Menu>
            <ButtonGroup size='xs' isAttached variant='outline'>
                <IconButton
                    fontSize="sm"
                    onClick={handleSortOrder}
                    aria-label='Add to fields'
                    icon={sortOrder === "asc" ? <HiSortAscending /> : <HiSortDescending />} />
                {/* <Button as={MenuButton} fontSize="x-small">
                    {sortField === '' ? "Sort by" : sortingFields.find(f => f.field === sortField)?.label}
                </Button> */}
            </ButtonGroup>

            {/* <SortMenu sortingFields={sortingFields} selectedField={onSortFieldSelect} /> */}

        </Menu>
    )
}