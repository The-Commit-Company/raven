import { MenuList, MenuItem } from "@chakra-ui/react"
import { SortFields } from "../../../types/Sort"

export interface Props {
    sortingFields: SortFields[],
    selectedField: (field: string) => void
}

/**
 * Renders 'Sort by' fields menu list.
 * @param sortingFields array of custom 'Sort by' fields & respective labels. Type - SortFields[]
 * @param selectedField callback for returning selected field to parent i.e., 'Sort' component.
 * @returns fields & callback to render fields & select  fields respectively.
 */
export const SortMenu = ({ sortingFields, selectedField }: Props) => {
    return (
        <MenuList zIndex={999} fontSize="xs" onClick={(e: any) => selectedField(e.target.value)}>
            {sortingFields.map(field => <MenuItem key={field.field} value={field.field}>{field.label}</MenuItem>)}
        </MenuList>
    )
}