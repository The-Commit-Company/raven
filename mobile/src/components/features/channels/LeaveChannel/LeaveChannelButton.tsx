import { useState } from "react"
import { LeaveChannelAlert } from "."
import { BiExit } from "react-icons/bi";
import { Button } from "@/components/ui/button"

export const LeaveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button variant="outline" className="border border-destructive space-x-1" onClick={() => setIsOpen(true)}>
                <BiExit size="18" className="text-destructive"/>
                <span className="text-xs text-destructive">Leave Channel</span>
            </Button>
            <LeaveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}