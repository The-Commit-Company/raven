import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import WorkspaceActions from "@components/features/workspaces/WorkspaceActions"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Badge } from "@components/ui/badge"
import { HStack } from "@components/ui/stack"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table"
import useFetchWorkspaces, { WorkspaceFields } from "@hooks/fetchers/useFetchWorkspaces"
import { Link } from "react-router-dom"


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
            {/* {isLoading && !error && <TableLoader columns={4} />} */}
            {/* Add ErrorBanner component here */}
            {/* <ErrorBanner error={error} /> */}
            {workspaces && <WorkspaceTable workspaces={workspaces.message} />}


        </div>

    )
}

const WorkspaceTable = ({ workspaces }: { workspaces: WorkspaceFields[] }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {workspaces.map((workspace) => (
                    <TableRow key={workspace.name}>
                        <TableCell className="max-w-[150px]">
                            {workspace.is_admin ? <Link to={`${workspace.name}`}>
                                <HStack align='center'>
                                    <Avatar className="rounded-md">
                                        <AvatarImage src={workspace.logo} alt={workspace.workspace_name} />
                                        <AvatarFallback>{workspace.workspace_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium hover:underline underline-offset-4">{workspace.workspace_name}</p>
                                </HStack>
                            </Link> :
                                <HStack align='center'>
                                    <Avatar>
                                        <AvatarImage src={workspace.logo} alt={workspace.workspace_name} />
                                        <AvatarFallback>{workspace.workspace_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium">{workspace.workspace_name}</p>
                                </HStack>}
                        </TableCell>

                        <TableCell>
                            <Badge variant="secondary" className={workspace.type === 'Private' ? 'text-purple-500 border-purple-500' : 'text-green-500 border-green-500'}>
                                <ChannelIcon type={workspace.type === 'Private' ? 'Private' : 'Open'} />
                                {workspace.type}
                                </Badge>
                        </TableCell>

                        <TableCell>
                            <HStack>
                                {workspace.is_admin ? <Badge variant="secondary" className="text-orange-500 border-orange-500">Admin</Badge> : workspace.workspace_member_name ? <Badge variant="secondary" className="text-blue-500 border-blue-500">Member</Badge> : <Badge variant="secondary" className="text-gray-500 border-gray-500">Not a member</Badge>}
                            </HStack>
                        </TableCell>

                        <TableCell>
                            <p className="text-sm text-muted-foreground line-clamp-1 text-ellipsis">{workspace.description}</p>
                        </TableCell>

                        <TableCell>
                            <WorkspaceActions workspace={workspace} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    )
}
