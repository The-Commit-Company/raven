import { DateMonthAtHourMinuteAmPm, HourMinuteAmPm } from '@/utils/dateConversions'
import { Tooltip, Text } from '@radix-ui/themes'
export const DateTooltip = ({ timestamp }: { timestamp: string }) => {
    return (
        <Tooltip content={<DateMonthAtHourMinuteAmPm date={timestamp} />}>
            <Text
                as='span'
                size='1'
                className='leading-3 hover:underline hover:cursor-pointer'
                color="gray"
            >
                <HourMinuteAmPm date={timestamp} />
            </Text>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp, showButtons }: { timestamp: string, showButtons: {} }) => {
    return (
        <Tooltip content={<DateMonthAtHourMinuteAmPm date={timestamp} />}>
            <Text
                as='span'
                style={showButtons}
                size='1'
                color="gray"
                className='leading-3 hover:underline pl-1 hover:cursor-pointer'
            >
                <HourMinuteAmPm date={timestamp} amPm={false} />
            </Text>
        </Tooltip>
    )
}