import { useUser } from "@hooks/useUser"
import { Message } from "@raven/types/common/Message"
import { UserAvatar } from "../UserAvatar"
import { getDateObject } from "@utils/date"
import { useMemo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"


export const MessageItem = ({ message }: { message: Message }) => {

    const { shortTime, longTime } = useMemo(() => {
        try {
            const dateObj = getDateObject(message.creation)
            return {
                shortTime: dateObj.format('hh:mm A'),
                longTime: dateObj.format('Do MMMM YYYY, hh:mm A'),
            }
        }
        catch (error) {
            return {
                shortTime: message.creation,
                longTime: message.creation,
            }
        }
    }, [message.creation])

    return <div data-message-id={message.name} className="group/message-item">
        {message.is_continuation === 0 ? <NonContinuationMessageHeader
            message={message} shortTime={shortTime} longTime={longTime}
        /> :
            <ContinuationMessageHeader message={message} />}
    </div>
}

const MessageContent = ({ message }: { message: Message }) => {

    return <div className="flex-1">
        {message.text && <div className="text-[13px] text-primary">{message.content}</div>}
    </div>
}

const NonContinuationMessageHeader = ({ message, shortTime, longTime }: { message: Message, shortTime: string, longTime: string }) => {

    const { data: user } = useUser(message.owner)

    if (!user) return null

    return <div className="flex items-start gap-3">
        <UserAvatar user={user} size="md" />
        <div className="flex-1">
            <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger>
                        <span className="text-xs font-light text-muted-foreground/90 tabular-nums">{shortTime}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {longTime}
                    </TooltipContent>
                </Tooltip>
            </div>
            <MessageContent message={message} />
            {/* {firstValidUrl && (
            <LinkPreview
                href={firstValidUrl}
                data={getDummyPreviewData()}
                onHide={handleHidePreview}
            />
        )} */}
        </div>
    </div>
}

const ContinuationMessageHeader = ({ message }: { message: Message }) => {

    return <div className="flex items-start gap-3">
        <div className="w-8 h-8">
        </div>
        <MessageContent message={message} />
    </div>
}