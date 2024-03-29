import { useState } from "react"
import { IoPersonAdd } from "react-icons/io5"
import { AddChannelMembers } from "./AddChannelMembers"
import { Button } from "@/components/ui/button"

interface AddChannelMembersButtonProps {
    pageRef: React.MutableRefObject<undefined>
    channelID: string
}

export const AddChannelMembersButton = ({ pageRef, channelID }: AddChannelMembersButtonProps) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* TODO: Styles to be added later when three button display: px-6 py-6 flex-col */}
            <Button variant="default" onClick={() => setIsOpen(true)} className="flex justify-center items-center gap-1 rounded-md">
                <div>
                    <IoPersonAdd size='14'/>
                </div>
                <span className="text-xs font-normal">
                    Add
                </span>
            </Button>
            <AddChannelMembers
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                presentingElement={pageRef.current}
                channelID={channelID} 
            />
        </>
    )
}