import { useState } from "react"
import { ViewChannelMembers } from "./ViewChannelMembers"
import { Button } from "@/components/ui/button"

interface ViewChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const ViewChannelMembersButton = ({ pageRef, channelID }: ViewChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div>
                <Button variant="link" onClick={() => setIsOpen(true)}>
                    <span className="text-xs">See all</span>
                </Button>
            </div>
            <ViewChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID} 
            />
        </>
    )
}