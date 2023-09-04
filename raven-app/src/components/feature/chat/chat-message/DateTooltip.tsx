import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString } from '@/utils/operations'
import { Tooltip } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'

export const DateTooltip = ({ timestamp }: { timestamp: Date }) => {
    return (
        <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`} placement='top' rounded='md'>
            <Text fontSize="xs" lineHeight={'0.9'} color="gray.500" _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>{DateObjectToTimeString(new Date(timestamp))}</Text>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp, showButtons }: { timestamp: Date, showButtons: {} }) => {
    return (
        <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`} placement='top' rounded='md'>
            <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(new Date(timestamp)).split(' ')[0]}</Text>
        </Tooltip>
    )
}