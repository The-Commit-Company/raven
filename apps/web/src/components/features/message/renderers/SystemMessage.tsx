import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { getDateObject } from "@lib/date";
import React, { useMemo } from "react";

interface SystemMessageProps {
    message: string
    time: string
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message, time }) => {

    const { shortTime, longTime } = useMemo(() => {
        try {
            const dateObj = getDateObject(time)
            return {
                shortTime: dateObj.format('HH:mm'),
                longTime: dateObj.format('Do MMMM YYYY, hh:mm A'),
            }
        }
        catch (error) {
            return {
                shortTime: time,
                longTime: time,
            }
        }
    }, [time])
    return (
        <div className="flex flex-row gap-3 px-3.5 py-2 items-baseline">
            <Tooltip delayDuration={300}>
                <TooltipTrigger>
                    <span className="text-xs text-ink-gray-5">{shortTime}</span>
                </TooltipTrigger>

                <TooltipContent>
                    {longTime}
                </TooltipContent>
            </Tooltip>
            <span className="text-p-xs text-ink-gray-5">{message}</span>
        </div>
    )
}

export default SystemMessage