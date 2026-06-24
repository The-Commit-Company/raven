import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { CalendarClock, CalendarIcon, EyeOff, ListChecks, Plus, X } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Switch } from '@components/ui/switch'
import { Separator } from '@components/ui/separator'
import { Calendar } from '@components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { DialogFooter, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { SmallTextField } from '@components/ui/form-elements'
import { getErrorMessage } from '@lib/frappe'
import { cn } from '@lib/utils'
import _ from '@lib/translate'

interface CreatePollFormProps {
    channelID: string
    onClose: () => void
}

interface PollFormData {
    question: string
    options: string[]
    is_anonymous: boolean
    is_multi_choice: boolean
    max_choices: number
}

const MAX_OPTIONS = 10

/** Half-hour granularity for the end-time picker. */
const TIME_STEP_SECONDS = 30 * 60

/**
 * Common poll answer sets. They drive the inline ghost-text suggestion: typing a prefix of
 * the first answer (e.g. "Y") suggests it ("Yes"), after which each later row suggests the
 * next answer in the set ("No", then "Maybe"). Purely a convenience — any text is allowed.
 */
const SUGGESTION_SEQUENCES = [
    ['Yes', 'No', 'Maybe'],
    ['Agree', 'Disagree'],
    ['Good', 'Bad', 'Neutral'],
    ['True', 'False'],
]

/**
 * Inline option input with a ghost-text suggestion. When `suggestion` continues what's typed
 * (or fills an empty row whose turn it is), the remainder shows muted behind the cursor and
 * Tab accepts it.
 */
const OptionInput = ({
    value,
    suggestion,
    placeholder,
    onChange,
    onAccept,
}: {
    value: string
    suggestion: string
    placeholder: string
    onChange: (value: string) => void
    onAccept: (value: string) => void
}) => {
    const remainder = suggestion.toLowerCase().startsWith(value.toLowerCase()) ? suggestion.slice(value.length) : ''
    return (
        <div className="relative flex-1">
            <Input
                value={value}
                placeholder={remainder ? '' : placeholder}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Tab' && !e.shiftKey && remainder) {
                        e.preventDefault()
                        onAccept(suggestion)
                    }
                }}
            />
            {remainder && (
                // Mirrors the Input's box (border + px-2.5 + text-base) so the invisible
                // spacer lines the remainder up exactly after the typed text.
                <div className="pointer-events-none absolute inset-0 flex items-center whitespace-pre rounded border border-transparent px-2.5 text-base text-ink-gray-4" aria-hidden>
                    <span className="invisible">{value}</span>
                    {remainder}
                </div>
            )}
        </div>
    )
}

export const CreatePollForm = ({ channelID, onClose }: CreatePollFormProps) => {
    const { call: createPoll, loading: isCreating } = useFrappePostCall('raven.api.raven_poll.create_poll')

    // The auto-close date/time lives outside the form (it's a combined value gated by a switch).
    const [autoClose, setAutoClose] = useState(false)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [endTime, setEndTime] = useState('17:00')

    const form = useForm<PollFormData>({
        defaultValues: { question: '', options: ['', ''], is_anonymous: false, is_multi_choice: false, max_choices: 2 },
        mode: 'onChange',
    })

    const options = form.watch('options')
    const isMultiChoice = form.watch('is_multi_choice')

    const setOptions = (next: string[]) => form.setValue('options', next)
    const addOption = () => setOptions([...options, ''])
    const removeOption = (index: number) => setOptions(options.filter((_opt, i) => i !== index))
    const updateOption = (index: number, value: string) => setOptions(options.map((opt, i) => (i === index ? value : opt)))

    // The suggested answer for a row: the first row matches a sequence by its typed prefix;
    // later rows take the next answer from whichever sequence the first row settled on.
    const getSuggestion = (index: number): string => {
        const current = (options[index] ?? '').trim()
        if (index === 0) {
            if (!current) return ''
            return SUGGESTION_SEQUENCES.find((seq) => seq[0].toLowerCase().startsWith(current.toLowerCase()))?.[0] ?? ''
        }
        const first = (options[0] ?? '').trim().toLowerCase()
        return SUGGESTION_SEQUENCES.find((seq) => seq[0].toLowerCase() === first)?.[index] ?? ''
    }

    const onSubmit = (data: PollFormData) => {
        const validOptions = data.options.map((o) => o.trim()).filter(Boolean)
        if (validOptions.length < 2) {
            form.setError('options', { message: _('At least 2 options are required') })
            return
        }

        let end_date: string | undefined
        if (autoClose && endDate) {
            const [hours, minutes] = endTime.split(':').map(Number)
            const closesAt = dayjs(endDate).hour(hours).minute(minutes).second(0)
            end_date = closesAt.format('YYYY-MM-DD HH:mm:ss')
        }

        // The backend posts the poll message to the channel; the realtime echo adds it to the
        // stream, so we just close on success.
        return createPoll({
            channel_id: channelID,
            question: data.question,
            options: validOptions.map((option) => ({ option })),
            is_multi_choice: data.is_multi_choice,
            is_anonymous: data.is_anonymous,
            end_date,
            max_choices: data.is_multi_choice ? Math.min(Number(data.max_choices) || 2, validOptions.length) : undefined,
        })
            .then(() => onClose())
            .catch((e) => toast.error(_('Could not create poll'), { description: getErrorMessage(e) }))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>{_('Create Poll')}</DialogTitle>
                </DialogHeader>

                <SmallTextField
                    name="question"
                    label={_('Question')}
                    isRequired
                    rules={{ required: _('Poll question is required') }}
                    inputProps={{ placeholder: _('What would you like to ask?'), rows: 2 }}
                />

                {/* Options */}
                <div className="flex flex-col gap-2">
                    <Label>{_('Options')}</Label>

                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <OptionInput
                                value={option}
                                suggestion={getSuggestion(index)}
                                placeholder={_('Option {0}', [String(index + 1)])}
                                onChange={(value) => updateOption(index, value)}
                                onAccept={(value) => updateOption(index, value)}
                            />
                            {options.length > 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    isIconButton
                                    onClick={() => removeOption(index)}
                                    aria-label={_('Remove option {0}', [String(index + 1)])}
                                >
                                    <X />
                                </Button>
                            )}
                        </div>
                    ))}

                    {options.length < MAX_OPTIONS && (
                        <Button type="button" variant="subtle" size="sm" className="w-fit" onClick={addOption}>
                            <Plus />
                            {_('Add option')}
                        </Button>
                    )}

                    <FormField control={form.control} name="options" render={() => <FormItem><FormMessage /></FormItem>} />
                </div>

                <Separator />

                {/* Settings */}
                <div className="flex flex-col gap-4">
                    <Label>{_('Poll Settings')}</Label>

                    <FormField
                        control={form.control}
                        name="is_multi_choice"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-ink-gray-5" />
                                        {_('Allow multiple choices')}
                                    </FormLabel>
                                    <FormDescription>{_('Voters can select more than one option')}</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {isMultiChoice && (
                        <FormField
                            control={form.control}
                            name="max_choices"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>{_('Maximum choices')}</FormLabel>
                                        <FormDescription>{_('How many options each person can select')}</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={2}
                                            max={options.length}
                                            className="w-20"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="is_anonymous"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="flex items-center gap-2">
                                        <EyeOff className="h-4 w-4 text-ink-gray-5" />
                                        {_('Anonymous poll')}
                                    </FormLabel>
                                    <FormDescription>{_('Hide voter identities from other participants')}</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Auto-close: gates the date + time pickers (toggle off to clear). */}
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-p-sm-medium text-ink-gray-7">
                                <CalendarClock className="h-4 w-4 text-ink-gray-5" />
                                {_('Close this poll automatically')}
                            </Label>
                            <p className="text-p-sm text-ink-gray-6">{_('Stop accepting votes at a chosen date and time')}</p>
                        </div>
                        <Switch checked={autoClose} onCheckedChange={setAutoClose} />
                    </div>

                    {autoClose && (
                        <div className="grid grid-cols-2 gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn('w-full justify-start font-normal', !endDate && 'text-ink-gray-4')}>
                                        <CalendarIcon />
                                        {endDate ? dayjs(endDate).format('MMM D, YYYY') : _('Pick date')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < new Date()} />
                                </PopoverContent>
                            </Popover>
                            <Input type="time" step={TIME_STEP_SECONDS} value={endTime} onChange={(e) => setEndTime(e.target.value)} className='[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none' />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
                        {_('Cancel')}
                    </Button>
                    <Button type="submit" loading={isCreating} loadingText={_('Creating...')} disabled={!form.watch('question')?.trim()}>
                        {_('Create Poll')}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
