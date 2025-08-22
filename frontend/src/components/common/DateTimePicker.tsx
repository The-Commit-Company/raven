import { Box } from "@radix-ui/themes"
import { ErrorText, Label } from "./Form"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { convertDateToTimeString } from "@/utils/dateConversions/utils"

interface DateTimePickerProps {
    value?: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    error?: string
    required?: boolean
    minDate?: Date
    maxDate?: Date
    disabled?: boolean
}

export const DateTimePicker = ({
    value,
    onChange,
    label,
    error,
    required = false,
    minDate = new Date(),
    maxDate,
    disabled = false,
}: DateTimePickerProps) => {
    // Convert Frappe datetime string to Date object for the picker
    const selectedDate = value ? new Date(value) : null

    const handleDateChange = (date: Date | null) => {
        if (date) {
            // Convert Date object to Frappe datetime format using the utility function
            const formattedDate = convertDateToTimeString(date)
            onChange(formattedDate)
        } else {
            onChange("")
        }
    }

    return (
        <Box>
            {label && <Label isRequired={required}>{label}</Label>}
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMM dd, yyyy h:mm aa"
                placeholderText="Select date and time"
                minDate={minDate}
                maxDate={maxDate}
                disabled={disabled}
                className="px-3 py-2.5 text-[13px] border border-gray-6 rounded-md bg-background text-foreground placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-a8 focus:border-transparent"
                wrapperClassName="w-full"
                popperClassName="!z-50"
                showPopperArrow={false}
                calendarClassName="!border-none !shadow-lg"
                dayClassName={(date: Date) =>
                    date && selectedDate && date.toDateString() === selectedDate.toDateString()
                        ? "!bg-[#5B5BD6] !text-white !rounded-full"
                        : "hover:!bg-[#5B5BD6]/10 !rounded-full"
                }
                dropdownMode="select"
                showMonthDropdown
                showYearDropdown
            />
            {error && <ErrorText>{error}</ErrorText>}
        </Box>
    )
}
