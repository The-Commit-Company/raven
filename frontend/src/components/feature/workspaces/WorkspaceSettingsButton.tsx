import { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { DropdownMenu } from '@radix-ui/themes'
import { BiCog } from 'react-icons/bi'

type Props = {
    workspace: WorkspaceFields
}

const WorkspaceSettingsButton = (props: Props) => {
    return (
        <DropdownMenu.Item color='gray'>
            <BiCog fontSize={16} />
            Settings
        </DropdownMenu.Item>
    )
}

export default WorkspaceSettingsButton