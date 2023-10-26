import { Select } from '@chakra-ui/react'

interface Props {
    options?: number[],
    selectedValue: number,
    updateValue: (value: number) => void
}

/**
 * The component takes an array(optional) and selected value to produce a select dropdown
 * It sends back the updated selected value via a callback function updateValue
 */
export const PageLengthSelector = ({ options = [20, 50, 100, 200, 500], updateValue, selectedValue }: Props) => {

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let numValue = parseInt(event.target.value)
        updateValue(numValue)
    }

    // if parent has provided options render those else use default options
    return (
        <Select
            size='xs'
            width='fit-content'
            borderRadius={6}
            value={selectedValue}
            onChange={handleChange}>
            {options?.map((option, index) => (
                <option key={index} value={option}>{option} rows</option>
            ))}
        </Select>
    )
}