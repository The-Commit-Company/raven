import { DropdownMenuItem } from "@components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { Settings } from "lucide-react"
import { WorkspaceFields } from "@hooks/fetchers/useFetchWorkspaces"

type Props = {
    workspace: WorkspaceFields
}

export default function WorkspaceSettingsButton (props: Props) {
    return (
        <DropdownMenuItem asChild>
            <Link to={`${props.workspace.name}`}>
                <Settings fontSize={16} />
                Manage
            </Link>
        </DropdownMenuItem>
    )
}
