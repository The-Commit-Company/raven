import { DateMonthAtHourMinuteAmPm, HourMinuteAmPm } from '@/utils/dateConversions'
import { Tooltip, Text, Link } from '@radix-ui/themes'
export const DateTooltip = ({ timestamp }: { timestamp: string }) => {
    return (
        <Tooltip content={<DateMonthAtHourMinuteAmPm date={timestamp} />}>
            <Link
                asChild
                size='1'
                color="gray"
            >
                <span>
                    <HourMinuteAmPm date={timestamp} />
                </span>
            </Link>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp }: { timestamp: string }) => {
    return (
        <Tooltip content={<DateMonthAtHourMinuteAmPm date={timestamp} />}>
            <Link
                asChild
                size='1'
                color="gray"
            >
                <span><HourMinuteAmPm date={timestamp} amPm={false} /></span>
            </Link>
        </Tooltip>
    )
}