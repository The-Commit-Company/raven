import { HStack } from '@components/ui/stack'
import { convertMillisecondsToReadableDate } from '@utils/date'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@components/ui/hover-card'
import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewRendererProps, NodeViewContent } from '@tiptap/react'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Clock, Clock7, Moon, Sunrise, Sunset, Sun } from 'lucide-react'

const ICON_SIZE = 14

export default Node.create({
    name: 'timestamp-renderer',

    group: 'inline',

    inline: true,

    content: 'inline*',

    atom: true,

    addAttributes() {
        return {
            class: {
                default: 'timestamp',
            },
            'data-timestamp-start': {
                default: '',
            },
            'data-timestamp-end': {
                default: '',
            },
            'data-timestamp-start-all-day': {
                default: 'false',
            },
            'data-timestamp-end-all-day': {
                default: 'false',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span.timestamp',
            },
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        return ['span', mergeAttributes(HTMLAttributes), 0]
    },

    addNodeView() {
        return ReactNodeViewRenderer(TimestampComponent)
    },
})

const TimestampComponent = ({ node }: NodeViewRendererProps) => {

    // Convert the timestamp to readable date format

    const startTimeInMilliseconds = node.attrs['data-timestamp-start']
    const endTimeInMilliseconds = node.attrs['data-timestamp-end']
    const startIsAllDay = node.attrs['data-timestamp-start-all-day'] === 'true' || node.attrs['data-timestamp-start-all-day'] === true


    const { icon, label } = useMemo(() => {

        let label = ''
        let icon = <Clock size={ICON_SIZE} />

        const startTime = convertMillisecondsToReadableDate(startTimeInMilliseconds)
        const endTime = endTimeInMilliseconds ? convertMillisecondsToReadableDate(endTimeInMilliseconds) : ''

        const today = dayjs()

        const isToday = startTime.isSame(today, 'day')

        const isTomorrow = startTime.isSame(today.add(1, 'day'), 'day')

        const isYesterday = startTime.isSame(today.subtract(1, 'day'), 'day')

        const isThisYear = startTime.isSame(today, 'year')

        // According to the time of day, decide the icon to be shown.

        //If there's a end time, we need to parse the text accordingly.

        // If it's an all day event, we don't need to show the time.

        if (!endTime) {
            // Only check the start time.

            if (startIsAllDay) {
                if (isToday) label = "Today"
                else if (isTomorrow) label = "Tomorrow"
                else if (isYesterday) label = "Yesterday"
                else if (isThisYear) label = startTime.format('Do MMMM')
                else label = startTime.format('Do MMMM YYYY')
            } else {
                if (isToday) {
                    label = startTime.format('hh:mm A') + ' today'
                } else if (isTomorrow) {
                    label = startTime.format('hh:mm A') + ' tomorrow'
                } else if (isYesterday) {
                    label = startTime.format('hh:mm A') + ' yesterday'
                } else if (isThisYear) {
                    label = startTime.format('hh:mm A [on] Do MMM')
                } else {
                    label = startTime.format('hh:mm A [on] Do MMM YYYY')
                }

                const hour = startTime.hour()

                // If between 5AM and 3PM, show full sun icon.
                // If between 3PM and 7PM, show half sun icon.

                // If between 7PM and 5AM, show crescent moon icon.
                if (hour <= 11 && hour >= 5) {
                    icon = <Sun size={ICON_SIZE} />
                } else if (hour > 11 && hour <= 16) {
                    icon = <Sunrise size={ICON_SIZE} />
                } else if (hour > 16 && hour < 19) {
                    icon = <Sunset size={ICON_SIZE} />
                } else if (hour >= 19 || hour <= 4) {
                    icon = <Moon size={ICON_SIZE} />
                }
            }

        } else {

            // There's a start and end time.
            // Need to check if both of them are on the same day or not.

            const isSameDay = startTime.isSame(endTime, 'day')

            if (isSameDay) {
                if (isToday) {
                    label = startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A') + ' today'
                } else if (isTomorrow) {
                    label = startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A') + ' tomorrow'
                } else if (isYesterday) {
                    label = startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A') + ' yesterday'
                } else {
                    label = startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A') + ' on Do MMM'
                }
            } else {
                if (startIsAllDay) {
                    label = startTime.format('Do MMM') + ' - ' + endTime.format('Do MMM')
                } else {
                    label = startTime.format('hh:mm A [on] Do MMM') + ' - ' + endTime.format('hh:mm A [on] Do MMM')
                }
            }
        }

        return { icon, label }
    }, [startTimeInMilliseconds, endTimeInMilliseconds])

    // ... existing code ...

    return <NodeViewWrapper as='div'>
        <HoverCard>
            <HoverCardTrigger>
                <span className='inline-flex items-center px-0.5 text-[var(--mention)] bg-mention/10'>
                    <Clock7 className='mr-1' size={ICON_SIZE} />
                    <NodeViewContent as='span' />
                </span>
            </HoverCardTrigger>
            <HoverCardContent className='rounded-md border border-border bg-popover py-2 px-3 shadow-md'>
                <div className='flex flex-col w-full gap-1'>
                    <HStack align='center' gap='2'>
                        <span className='text-muted-foreground'>
                            {icon}
                        </span>
                        <span className='text-sm font-medium text-foreground'>
                            {label}
                        </span>
                    </HStack>
                </div>
            </HoverCardContent>
        </HoverCard>
    </NodeViewWrapper >
}
