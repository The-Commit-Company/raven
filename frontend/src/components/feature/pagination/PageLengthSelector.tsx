import { Select } from "@radix-ui/themes"

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

    const handleChange = (value: string) => {
        let numValue = parseInt(value)
        updateValue(numValue)
    }

    // if parent has provided options render those else use default options
    return (
        <Select.Root size='1' onValueChange={handleChange} value={selectedValue.toString()}>
            <Select.Trigger variant="soft" color="gray" />
            <Select.Content className="z-50">
                {options?.map((option) => (
                    <Select.Item key={option} value={option.toString()}>{option} rows</Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    )
}