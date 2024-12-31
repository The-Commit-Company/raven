import { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { DropdownMenu } from '@radix-ui/themes'
import { BiCog } from 'react-icons/bi'
import { Link } from 'react-router-dom'

type Props = {
    workspace: WorkspaceFields
}

const WorkspaceSettingsButton = (props: Props) => {
    return (
        <DropdownMenu.Item asChild>
            <Link to={`${props.workspace.name}`}>
                <BiCog fontSize={16} />
                Manage
            </Link>
        </DropdownMenu.Item>
    )
}

export default WorkspaceSettingsButton