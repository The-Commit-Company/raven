import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString } from '@/utils/operations'
import { Tooltip, Text } from '@radix-ui/themes'

export const DateTooltip = ({ timestamp }: { timestamp: string }) => {
    return (
        <Tooltip content={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`}>
            <Text
                as='span'
                size='1'
                className='leading-3 hover:underline hover:cursor-pointer'
                color="gray"
            >
                {DateObjectToTimeString(new Date(timestamp))}
            </Text>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp, showButtons }: { timestamp: string, showButtons: {} }) => {
    return (
        <Tooltip content={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`}>
            <Text
                as='span'
                style={showButtons}
                size='1'
                color="gray"
                className='leading-3 hover:underline pl-1 hover:cursor-pointer'
            >
                {DateObjectToTimeString(new Date(timestamp)).split(' ')[0]}
            </Text>
        </Tooltip>
    )
}