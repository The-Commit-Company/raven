import { DataTable } from "@components/common/DataTable/DataTable"
import WorkspaceActions from "@components/features/workspaces/WorkspaceActions"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Badge } from "@components/ui/badge"
import useFetchWorkspaces, { WorkspaceFields } from "@hooks/fetchers/useFetchWorkspaces"
import { Link } from "react-router-dom"
import { Globe, Lock } from "lucide-react"
import type { ColumnDef } from "../../../types/DataTable"

export default function WorkspaceList() {

    const { data: workspaces, isLoading, error } = useFetchWorkspaces()

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-1">
                <h2 className="text-base font-semibold">Workspaces</h2>
                <p className="text-sm text-muted-foreground">
                    Workspaces allow you to organize your channels and teams.
                </p>
            </div>

            <DataTable
                columns={workspaceColumns}
                data={workspaces?.message ?? []}
                isLoading={isLoading}
                error={error}
                getRowId={(row) => row.name}
                emptyState={<EmptyWorkspaceState />}
            />
        </div>
    )
}

/**
 * Column definitions for the Workspace table.
 * Defined outside the component to avoid recreation on every render.
 */
const workspaceColumns: ColumnDef<WorkspaceFields>[] = [
    {
        id: "name",
        accessorKey: "workspace_name",
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => <WorkspaceNameCell workspace={row} />,
    },
    {
        id: "type",
        accessorKey: "type",
        header: "Type",
        enableSorting: false,
        cell: ({ row }) => <WorkspaceTypeCell type={row.type} />,
    },
    {
        id: "membership",
        accessorKey: "workspace_member_name",
        header: "Membership",
        enableSorting: false,
        cell: ({ row }) => <MembershipCell workspace={row} />,
    },
    {
        id: "description",
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cellClassName: "max-w-[250px]",
        cell: ({ value }) => (
            <span className="line-clamp-1 text-muted-foreground">
                {value as string}
            </span>
        ),
    },
    {
        id: "actions",
        header: "",
        enableSorting: false,
        cellClassName: "w-[50px]",
        cell: ({ row }) => <WorkspaceActions workspace={row} />,
    },
]

/**
 * Name column: Shows workspace logo, name, and links to settings if admin.
 */
function WorkspaceNameCell({ workspace }: { workspace: WorkspaceFields }) {
    const content = (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage src={workspace.logo} alt={workspace.workspace_name} />
                <AvatarFallback className="rounded-md">
                    {workspace.workspace_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <span className="font-medium">{workspace.workspace_name}</span>
        </div>
    )

    // If user is admin, make it a link to workspace settings
    if (workspace.is_admin) {
        return (
            <Link
                to={workspace.name}
                className="hover:underline underline-offset-4"
            >
                {content}
            </Link>
        )
    }

    return content
}

/**
 * Type column: Shows badge with icon indicating Public/Private.
 */
function WorkspaceTypeCell({ type }: { type: WorkspaceFields["type"] }) {
    const isPrivate = type === "Private"

    return (
        <Badge variant={isPrivate ? "secondary" : "outline"}>
            {isPrivate ? (
                <Lock className="mr-1 h-3 w-3" />
            ) : (
                <Globe className="mr-1 h-3 w-3" />
            )}
            {type}
        </Badge>
    )
}

/**
 * Membership column: Shows user's role in the workspace.
 */
function MembershipCell({ workspace }: { workspace: WorkspaceFields }) {
    if (workspace.is_admin) {
        return <Badge variant="default">Admin</Badge>
    }
    if (workspace.workspace_member_name) {
        return <Badge variant="secondary">Member</Badge>
    }
    return <Badge variant="outline">Not a member</Badge>
}

/**
 * Empty state when no workspaces exist.
 */
function EmptyWorkspaceState() {
    return (
        <div className="flex flex-col items-center gap-2 py-8">
            <p className="text-muted-foreground">No workspaces found.</p>
        </div>
    )
}
