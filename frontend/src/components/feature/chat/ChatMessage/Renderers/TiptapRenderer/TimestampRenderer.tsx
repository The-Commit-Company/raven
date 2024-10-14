import { HStack, Stack } from '@/components/layout/Stack'
import { convertMillisecondsToReadableDate } from '@/utils/dateConversions/utils'
import { HoverCard, Text } from '@radix-ui/themes'
import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewRendererProps, NodeViewContent } from '@tiptap/react'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { BiMoon, BiTime } from 'react-icons/bi'
import { TbSun, TbSunHigh, TbSunset2 } from 'react-icons/tb'

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
        let icon = <BiTime />

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
                    icon = <TbSun />
                } else if (hour > 11 && hour <= 16) {
                    icon = <TbSunHigh />
                } else if (hour > 16 && hour < 19) {
                    icon = <TbSunset2 />
                } else if (hour >= 19 || hour <= 4) {
                    icon = <BiMoon />
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

    return <NodeViewWrapper as='span'>
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Text as='span' className='bg-accent-3 px-0.5 text-accent-11'>
                    <BiTime className='mr-1 -mb-0.5' />
                    <NodeViewContent as='span' />
                </Text>
            </HoverCard.Trigger>
            <HoverCard.Content size='1' className='rounded-sm dark:bg-gray-4 py-2 px-2'>
                <Stack>
                    <HStack align='center'>
                        {icon}
                        <Text as='span' size='2' weight='medium'>
                            {label}
                        </Text>
                    </HStack>
                </Stack>

            </HoverCard.Content>
        </HoverCard.Root>
    </NodeViewWrapper >
}