import { useState } from "react"
import { ArchiveChannelAlert } from "."
import { BiArchiveIn } from "react-icons/bi"
import { Button } from "@/components/ui/button"

export const ArchiveChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button variant="outline" className="space-x-1" onClick={() => setIsOpen(true)}>
                <BiArchiveIn size="18"/>
                <span className="text-xs">Archive</span>
            </Button>
            <ArchiveChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}