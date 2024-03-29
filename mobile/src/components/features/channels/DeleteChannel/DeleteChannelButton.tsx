import { useState } from "react"
import { DeleteChannelAlert } from "."
import { BiTrash } from "react-icons/bi";
import { Button } from "@/components/ui/button";


export const DeleteChannelButton = ({ channelID }: { channelID: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button variant="outline" className="border border-destructive space-x-1" onClick={() => setIsOpen(true)}>
                <BiTrash size="18" className="text-destructive"/>
                <span className="text-xs text-destructive">Delete Channel</span>
            </Button>
            <DeleteChannelAlert isOpen={isOpen} onDismiss={() => setIsOpen(false)} channelID={channelID} />
        </>
    )
}