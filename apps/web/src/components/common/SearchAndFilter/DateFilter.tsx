
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../../../lib/utils"
import { Button } from "@components/ui/button"
import { Calendar } from "@components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Separator } from "@components/ui/separator"
import { CSSProperties } from "react"
import React from "react"

export interface DateRange {
    from?: Date,
    to?: Date,
    preset?: string
}

interface DateFilterProps {
    value: DateRange,
    onValueChange: (value: DateRange) => void,
    className?: string,
    style?: CSSProperties,
    /**
     * Optional className for the dropdown panel (PopoverContent).
     * Use this to control the width or style of the dropdown panel separately from the button.
     */
    dropdownClassName?: string,
    /**
     * Optional style for the dropdown panel (PopoverContent).
     */
    dropdownStyle?: CSSProperties
}

export default function DateFilter({ value, onValueChange, className, style, dropdownClassName, dropdownStyle }: DateFilterProps) {

    const presetOptions = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "This week", value: "this-week" },
        { label: "This month", value: "this-month" },
    ]

    const [isOpen, setIsOpen] = React.useState(false)

    const handlePresetSelect = (preset: string) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        let from, to
        switch (preset) {
            case "today":
                from = to = today
                break
            case "yesterday":
                from = to = yesterday
                break
            case "this-week": {
                const startOfWeek = new Date(today)
                startOfWeek.setDate(today.getDate() - today.getDay())
                from = startOfWeek
                to = today
                break
            }
            case "this-month": {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                from = startOfMonth
                to = today
                break
            }
            default:
                from = undefined
                to = undefined
        }
        onValueChange({ from, to, preset })
    }

    const handleFromChange = (date?: Date) => {
        onValueChange({ ...value, from: date, preset: undefined })
    }
    const handleToChange = (date?: Date) => {
        onValueChange({ ...value, to: date, preset: undefined })
    }
    const handleClear = () => {
        onValueChange({ from: undefined, to: undefined, preset: undefined })
    }
    const handleApply = () => {
        setIsOpen(false)
    }

    // Compose trigger label
    let triggerLabel = "Date"
    if (value.preset) {
        const preset = presetOptions.find(p => p.value === value.preset)
        triggerLabel = preset ? preset.label : "Date"
    } else if (value.from && value.to) {
        triggerLabel = `${format(value.from, "dd MMM yyyy")} - ${format(value.to, "dd MMM yyyy")}`
    } else if (value.from) {
        triggerLabel = format(value.from, "dd MMM yyyy")
    } else if (value.to) {
        triggerLabel = format(value.to, "dd MMM yyyy")
    }

    return (
        <div className={cn("w-full", className)} style={style}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={"w-full max-w-xs justify-between text-left font-normal h-9 px-2"}>
                        <span>{triggerLabel}</span>
                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-30" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-80 p-0", dropdownClassName)} style={dropdownStyle} align="start">
                    <div>
                        {/* Preset Options */}
                        <div className="flex flex-col gap-0.5 mb-1 p-1">
                            {presetOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={value.preset === option.value ? "secondary" : "ghost"}
                                    className={cn(
                                        "justify-start h-8 px-2 text-sm font-normal",
                                        value.preset === option.value && "font-medium"
                                    )}
                                    onClick={() => handlePresetSelect(option.value)}>
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                        <Separator />
                        {/* Custom Date Range */}
                        <div className="flex flex-col gap-3.5 p-3">
                            {/* From Date */}
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">From</div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full justify-start text-left font-normal h-8 px-2", !value.from && "text-muted-foreground")}>
                                            <CalendarIcon className="h-4 w-4" />
                                            {value.from ? format(value.from, "dd MMM yyyy") : "Select a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={value.from} onSelect={handleFromChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* To Date */}
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">To</div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full justify-start text-left font-normal h-8 px-2", !value.to && "text-muted-foreground")}>
                                            <CalendarIcon className="h-4 w-4" />
                                            {value.to ? format(value.to, "dd MMM yyyy") : "Select a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={value.to} onSelect={handleToChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" className="h-8 px-2" onClick={handleClear}>Clear</Button>
                                <Button className="h-8 px-2" onClick={handleApply}>Apply</Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
} 