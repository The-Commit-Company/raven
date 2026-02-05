import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import useFetchWorkspaces, { WorkspaceFields } from "@hooks/fetchers/useFetchWorkspaces"
import { useFrappeGetCall, useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner"
import { Card } from "@components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { ArrowUpRight } from "lucide-react"

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
        return <span className="text-sm text-muted-foreground font-medium">No members</span>
    }

    if (data.message === 1) {
        return <span className="text-sm text-muted-foreground font-medium">1 solo member</span>
    }

    return <span className="text-sm text-muted-foreground font-medium">{data.message} members</span>
}

export const WorkspaceSwitcherGrid = () => {
    const { data } = useFetchWorkspaces()
    const navigate = useNavigate()

    const { myWorkspaces, otherWorkspaces } = useMemo(() => {
        const myWorkspaces: WorkspaceFields[] = []
        const otherWorkspaces: WorkspaceFields[] = []

        if (data) {
            data.message.forEach((workspace) => {
                if (workspace.workspace_member_name) {
                    myWorkspaces.push(workspace)
                } else {
                    otherWorkspaces.push(workspace)
                }
            })
        }

        return { myWorkspaces, otherWorkspaces }
    }, [data])

    const openWorkspace = (workspaceName: string) => {
        // Save to localStorage
        localStorage.setItem('ravenLastWorkspace', JSON.stringify(workspaceName))
        localStorage.removeItem('ravenLastChannel')
        navigate(`/${encodeURIComponent(workspaceName)}`)
    }

    return (
        <div className="sm:p-28 py-16 sm:px-8 px-4 gap-16 animate-fadein">
            <div className="container flex mx-auto flex-col gap-5 max-w-screen-lg">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold">My Workspaces</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                        Switch between workspaces that you are a member of.
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
                        <h2 className="text-xl font-semibold">Other Workspaces</h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            Explore other workspaces that you can join.
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
                aria-label={`Switch to ${workspace.workspace_name} workspace`}
                to={`/${encodeURIComponent(workspace.name)}`}
                onClick={() => onOpen(workspace.name)}
                className="block p-4"
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/80 dark:border-border/60">
                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                        <AvatarFallback>{workspace.workspace_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-base font-semibold truncate">{workspace.workspace_name}</h3>
                            {workspace.type === 'Public' ? (
                                <span className="text-sm text-muted-foreground font-medium">Public</span>
                            ) : (
                                <span className="text-sm text-muted-foreground font-medium">Private</span>
                            )}
                        </div>
                        {workspace.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
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
                loading: 'Joining workspace...',
                success: 'You have joined the workspace.',
                error: (error) => `There was an error while joining the workspace.\n${error.message || 'Unknown error'}`,
            }
        )
    }

    return (
        <Card className="relative shadow-sm hover:scale-105 transition-all duration-200">
            <div
                role="button"
                onClick={joinWorkspace}
                title={`Join ${workspace.workspace_name} workspace`}
                aria-label={`Join ${workspace.workspace_name} workspace`}
                className="p-4"
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/80 dark:border-border/60">
                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                        <AvatarFallback>{workspace.workspace_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-base font-semibold truncate">{workspace.workspace_name}</h3>
                            <WorkspaceMemberCount workspace={workspace.name} />
                        </div>
                        {workspace.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                                {workspace.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-3">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </Card>
    )
}
