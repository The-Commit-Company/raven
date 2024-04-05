import { useState } from "react"
import { ViewChannelMembers } from "./ViewChannelMembers"
import { Button } from "@radix-ui/themes"

interface ViewChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const ViewChannelMembersButton = ({ pageRef, channelID }: ViewChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button variant="ghost" onClick={() => setIsOpen(true)}>
                See all
            </Button>
            <ViewChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID}
            />
        </>
    )
}