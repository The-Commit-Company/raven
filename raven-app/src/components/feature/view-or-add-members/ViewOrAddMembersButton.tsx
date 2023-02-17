import { Button, ButtonGroup, IconButton } from "@chakra-ui/react"
import { RiUserAddLine } from "react-icons/ri"

interface ViewOrAddMembersButtonProps {
    onClickViewMembers: () => void,
    onClickAddMembers: () => void
}

export const ViewOrAddMembersButton = ({ onClickViewMembers, onClickAddMembers }: ViewOrAddMembersButtonProps) => {
    return (
        <ButtonGroup isAttached size='sm' variant='outline'>
            <Button onClick={onClickViewMembers}>
                view members
            </Button>
            <IconButton
                onClick={onClickAddMembers}
                aria-label={"add members to channel"}
                icon={<RiUserAddLine />}
            />
        </ButtonGroup>
    )
}