import { useMemo } from 'react'
import { Tooltip, Link } from '@radix-ui/themes'
import { getDateObject } from '@/utils/dateConversions/utils'

export const DateTooltip = ({ timestamp }: { timestamp: string }) => {

    const { tooltipContent, time } = useMemo(() => {

        const dateObj = getDateObject(timestamp)

        return {
            tooltipContent: dateObj.format("Do MMMM [at] hh:mm A"),
            time: dateObj.format("hh:mm A")
        }

    }, [timestamp])

    return (
        <Tooltip content={tooltipContent}>
            <Link
                asChild
                size='1'
                color="gray"
            >
                <span>
                    {time}
                </span>
            </Link>
        </Tooltip>
    )
}

export const DateTooltipShort = ({ timestamp }: { timestamp: string }) => {

    const { tooltipContent, time } = useMemo(() => {

        const dateObj = getDateObject(timestamp)

        return {
            tooltipContent: dateObj.format("Do MMMM [at] hh:mm A"),
            time: dateObj.format("hh:mm")
        }

    }, [timestamp])

    return (
        <Tooltip content={tooltipContent}>
            <Link
                asChild
                style={{ fontSize: '0.68rem' }}
                color="gray"
            >
                <span>{time}</span>
            </Link>
        </Tooltip>
    )
}