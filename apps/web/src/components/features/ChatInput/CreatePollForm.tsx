import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Label } from '@components/ui/label'
import { Switch } from '@components/ui/switch'
import { ScrollArea } from '@components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Calendar } from '@components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import {
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@components/ui/form'
import { X, Plus, CalendarIcon, Clock, BarChart3, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@lib/utils'
import { format } from 'date-fns'

interface CreatePollFormProps {
    channelID: string
    onClose: () => void
}

interface PollFormData {
    question: string
    options: string[]
    is_anonymous: boolean
    is_multi_choice: boolean
    end_date?: string
}

export const CreatePollForm = ({ channelID, onClose }: CreatePollFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<PollFormData>({
        defaultValues: {
            question: '',
            options: ['', ''],
            is_anonymous: false,
            is_multi_choice: false,
            end_date: undefined,
        },
        mode: 'onChange',
    })

    const options = form.watch('options') || []

    const addOption = () => {
        form.setValue('options', [...options, ''])
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index)
            form.setValue('options', newOptions)
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        form.setValue('options', newOptions)
    }

    // Preset option templates
    const optionPresets = [
        { label: 'Yes / No', options: ['Yes', 'No'] },
        { label: 'Yes / No / Maybe', options: ['Yes', 'No', 'Maybe'] },
        { label: 'Agree / Disagree', options: ['Agree', 'Disagree'] },
        { label: 'Good / Bad / Neutral', options: ['Good', 'Bad', 'Neutral'] },
    ]

    const applyPreset = (presetOptions: string[]) => {
        // Ensure we have at least 2 options, pad with empty strings if needed
        const newOptions = [...presetOptions]
        while (newOptions.length < 2) {
            newOptions.push('')
        }
        // Trim to max 10 options
        form.setValue('options', newOptions.slice(0, 10))
    }

    const clearOptions = () => {
        form.setValue('options', ['', ''])
    }

    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [endTime, setEndTime] = useState<string>('23:59:00')

    // Time options for the time picker
    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2)
        const minute = i % 2 === 0 ? '00' : '30'
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const timeString = `${String(displayHour).padStart(2, '0')}:${minute} ${period}`
        const value = `${String(hour).padStart(2, '0')}:${minute}:00`
        return { label: timeString, value }
    })

    const onSubmit = async (data: PollFormData) => {
        try {
            setIsSubmitting(true)
            // Filter out empty options
            const validOptions = data.options.filter(opt => opt.trim() !== '')

            if (validOptions.length < 2) {
                form.setError('options', { message: 'At least 2 options are required' })
                return
            }

            // Combine date and time for end_date
            let finalEndDate: string | undefined = undefined
            if (endDate) {
                const [hours, minutes] = endTime.split(':')
                const dateTime = new Date(endDate)
                dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                finalEndDate = dateTime.toISOString()
            }

            // TODO: Implement actual poll creation API call
            console.log('Creating poll:', {
                channelID,
                question: data.question,
                options: validOptions,
                is_anonymous: data.is_anonymous ? 1 : 0,
                is_multi_choice: data.is_multi_choice ? 1 : 0,
                end_date: finalEndDate || undefined,
            })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Close dialog and reset form on success
            onClose()
            form.reset()
            setEndDate(undefined)
            setEndTime('23:59:00')
        } catch (error) {
            console.error('Error creating poll:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedTimeOption = timeOptions.find(opt => opt.value === endTime) || timeOptions[0]

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b shrink-0 bg-muted/30">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Create Poll</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <div className="px-4 py-4 space-y-5">
                            {/* Question Section */}
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    rules={{ required: 'Poll question is required' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                                                Question
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="What would you like to ask?"
                                                    {...field}
                                                    className="min-h-[70px] resize-none text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Options Section */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Options</Label>
                                </div>
                                {/* Quick Presets */}
                                <div className="flex items-center justify-between pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Quick presets:</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs px-2"
                                                >
                                                    <Sparkles className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                                    Choose preset
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-2" align="start">
                                                <div className="space-y-1">
                                                    {optionPresets.map((preset, idx) => (
                                                        <Button
                                                            key={idx}
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                applyPreset(preset.options)
                                                            }}
                                                            className="w-full justify-start h-8 text-xs"
                                                        >
                                                            {preset.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearOptions}
                                        className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="space-y-2 pb-3">
                                    {options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2 group">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/5 text-muted-foreground font-semibold text-xs shrink-0">
                                                {index + 1}
                                            </div>
                                            <Input
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                className="flex-1 h-8 text-sm"
                                            />
                                            {options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeOption(index)}
                                                    aria-label={`Remove option ${index + 1}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {options.length < 10 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="w-full h-8 border-dashed text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1.5" />
                                        Add Option
                                    </Button>
                                )}
                                {options.length >= 10 && (
                                    <p className="text-[11px] text-muted-foreground text-center py-1">
                                        Maximum 10 options allowed
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Settings Section */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Poll Settings</Label>

                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="is_multi_choice"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-2.5 bg-muted/30">
                                                <div className="space-y-0.5 flex-1">
                                                    <FormLabel className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                                                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                                        Allow multiple choices
                                                    </FormLabel>
                                                    <FormDescription className="text-[11px] font-normal text-muted-foreground">
                                                        Voters can select more than one option
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_anonymous"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-2.5 bg-muted/30">
                                                <div className="space-y-0.5 flex-1">
                                                    <FormLabel className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                                                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                        Anonymous poll
                                                    </FormLabel>
                                                    <FormDescription className="text-[11px] font-normal text-muted-foreground">
                                                        Hide voter identities from other participants
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* End Date */}
                                    <div className="rounded-md border p-2.5 bg-muted/30 space-y-2.5">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-medium flex items-center gap-1.5">
                                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                                End date (optional)
                                            </Label>
                                            <p className="text-[11px] font-normal text-muted-foreground">
                                                Automatically close the poll at a specific date and time
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal text-xs px-3",
                                                            !endDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0" />
                                                        <span className="truncate">{endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={setEndDate}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Select value={endTime} onValueChange={setEndTime}>
                                                <SelectTrigger className="w-full text-xs px-3">
                                                    <Clock className="mr-1.5 h-3 w-3 shrink-0" />
                                                    <SelectValue className="truncate">{selectedTimeOption.label}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {endDate && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEndDate(undefined)
                                                    setEndTime('23:59:00')
                                                }}
                                                className="w-full text-xs h-8"
                                            >
                                                Clear end date
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t shrink-0 bg-muted/30 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="h-8 text-xs px-3"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !form.watch('question')?.trim()}
                        className="h-8 text-xs px-3"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                Create Poll
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

