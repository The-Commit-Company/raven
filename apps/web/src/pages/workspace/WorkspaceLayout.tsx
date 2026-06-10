import { ChannelSidebar } from '@components/channel-sidebar/ChannelSidebar'
import AppHeader from '@components/features/header/AppHeader'
import { Sidebar, SidebarProvider } from '@components/ui/sidebar'
import _ from '@lib/translate'
import { Outlet } from 'react-router'

type Props = {}

const WorkspaceLayout = (props: Props) => {
    return (
        <div className='flex flex-col h-full min-h-0 w-full'>

            <AppHeader title={_("Workspace")} />

            <div className='flex min-h-0 flex-1'>
                <SidebarProvider>
                    <ChannelSidebar />
                </SidebarProvider>

                <div className='flex min-w-0 min-h-0 flex-1 flex-col'>
                    <Outlet />
                </div>
            </div>

        </div>
    )
}

export default WorkspaceLayout