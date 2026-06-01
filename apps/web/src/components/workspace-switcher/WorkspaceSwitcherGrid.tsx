import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useFrappeGetCall, useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner"
import { Card } from "@components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { ArrowUpRight } from "lucide-react"
import { useWorkspaces, WorkspaceFields } from "@hooks/useWorkspaces"
import _ from "@lib/translate"

const getLogo = (workspace: WorkspaceFields) => {
    let logo = workspace.logo || ''

    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }

    return logo
}

const WorkspaceMemberCount = ({ workspace }: { workspace: string }) => {
    const { data } = useFrappeGetCall('raven.api.workspaces.get_workspace_member_count', { workspace })

    if (data === undefined) {
        return null
    }

    if (data.message === 0) {
        return <span className="text-sm text-ink-gray-4 font-medium">{_("No members")}</span>
    }

    if (data.message === 1) {
        return <span className="text-sm text-ink-gray-4 font-medium">{_("1 solo member")}</span>
    }

    return <span className="text-sm text-ink-gray-4 font-medium">{_("{0} members", [data.message])}</span>
}

export const WorkspaceSwitcherGrid = () => {
    const { workspaces } = useWorkspaces()
    const navigate = useNavigate()

    const { myWorkspaces, otherWorkspaces } = useMemo(() => {
        const myWorkspaces: WorkspaceFields[] = []
        const otherWorkspaces: WorkspaceFields[] = []

        if (workspaces) {
            workspaces.forEach((workspace) => {
                if (workspace.workspace_member_name) {
                    myWorkspaces.push(workspace)
                } else {
                    otherWorkspaces.push(workspace)
                }
            })
        }

        return { myWorkspaces, otherWorkspaces }
    }, [workspaces])

    const openWorkspace = (workspaceName: string) => {
        localStorage.setItem('ravenLastWorkspace', JSON.stringify(workspaceName))
        localStorage.removeItem('ravenLastChannel')
        navigate(`/${encodeURIComponent(workspaceName)}`)
    }

    return (
        <div className="sm:p-28 py-16 sm:px-8 px-4 gap-16 animate-fadein">
            <div className="container flex mx-auto flex-col gap-5 max-w-screen-lg">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold">{_("My Workspaces")}</h2>
                    <p className="text-sm text-ink-gray-4 font-medium">
                        {_("Switch between workspaces that you are a member of.")}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {myWorkspaces.map((workspace) => (
                        <MyWorkspaceItem key={workspace.name} workspace={workspace} onOpen={openWorkspace} />
                    ))}
                </div>
            </div>
            {otherWorkspaces.length > 0 && (
                <div className="container flex mx-auto flex-col gap-5 max-w-screen-lg mt-16">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold">{_("Other Workspaces")}</h2>
                        <p className="text-sm text-ink-gray-4 font-medium">
                            {_("Explore other workspaces that you can join.")}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {otherWorkspaces.map((workspace) => (
                            <OtherWorkspaceItem key={workspace.name} workspace={workspace} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const MyWorkspaceItem = ({ workspace, onOpen }: { workspace: WorkspaceFields; onOpen: (name: string) => void }) => {
    const logo = getLogo(workspace)

    return (
        <Card className="shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer">
            <Link
                aria-label={_("Switch to {0} workspace", [workspace.workspace_name])}
                to={`/${encodeURIComponent(workspace.name)}`}
                onClick={() => onOpen(workspace.name)}
                className="block p-4"
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-outline-gray-2">
                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                        <AvatarFallback className="bg-surface-gray-2 text-ink-gray-7">{workspace.workspace_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-base font-semibold truncate">{workspace.workspace_name}</h3>
                            {workspace.type === 'Public' ? (
                                <span className="text-sm text-ink-gray-4 font-medium">{_("Public")}</span>
                            ) : (
                                <span className="text-sm text-ink-gray-4 font-medium">{_("Private")}</span>
                            )}
                        </div>
                        {workspace.description && (
                            <p className="text-sm text-ink-gray-4 line-clamp-2 text-ellipsis">
                                {workspace.description}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    )
}

const OtherWorkspaceItem = ({ workspace }: { workspace: WorkspaceFields }) => {
    const logo = getLogo(workspace)
    const { call } = useFrappePostCall('raven.api.workspaces.join_workspace')
    const { mutate } = useSWRConfig()

    const joinWorkspace = () => {
        toast.promise(
            call({ workspace: workspace.name }).then(() => {
                mutate('workspaces_list')
                mutate('channel_list')
            }),
            {
                loading: _("Joining workspace..."),
                success: _("You have joined the workspace."),
                error: (error) => _("There was an error while joining the workspace.\n{0}", [error.message || _("Unknown error")]),
            }
        )
    }

    return (
        <Card className="relative shadow-sm hover:scale-105 transition-all duration-200">
            <div
                role="button"
                onClick={joinWorkspace}
                title={_("Join {0} workspace", [workspace.workspace_name])}
                aria-label={_("Join {0} workspace", [workspace.workspace_name])}
                className="p-4"
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-outline-gray-2">
                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                        <AvatarFallback className="bg-surface-gray-2 text-ink-gray-7">{workspace.workspace_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-base font-semibold truncate">{workspace.workspace_name}</h3>
                            <WorkspaceMemberCount workspace={workspace.name} />
                        </div>
                        {workspace.description && (
                            <p className="text-sm text-ink-gray-4 line-clamp-2 text-ellipsis">
                                {workspace.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-3">
                <ArrowUpRight className="w-4 h-4 text-ink-gray-4" />
            </div>
        </Card>
    )
}
