import { DateMonthAtHourMinuteAmPm, HourMinuteAmPm } from '@/utils/dateConversions'
import { useMemo } from 'react'
import { Tooltip, Link } from '@radix-ui/themes'
export const DateTooltip = ({ timestamp }: { timestamp: string }) => {
    const memoizedTime = useMemo(() => <HourMinuteAmPm date={timestamp} />, [timestamp])
    return (
        <Tooltip content={<DateMonthAtHourMinuteAmPm date={timestamp} />}>
            <Link
                asChild
                size='1'
                color="gray"
            >
                <span>
                    {memoizedTime}
                </span>
            </Link>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp }: { timestamp: string }) => {
    const memoizedContent = useMemo(
        () => <DateMonthAtHourMinuteAmPm date={timestamp} />,
        [timestamp]
    )
    const memoizedTime = useMemo(
        () => <HourMinuteAmPm date={timestamp} amPm={false} />,
        [timestamp]
    )

    return (
        <Tooltip content={memoizedContent}>
            <Link
                asChild
                style={{ fontSize: '0.68rem' }}
                color="gray"
            >
                <span>{memoizedTime}</span>
            </Link>
        </Tooltip>
    )
}