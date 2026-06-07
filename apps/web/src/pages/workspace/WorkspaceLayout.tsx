import { ChannelSidebar } from '@components/channel-sidebar/ChannelSidebar'
import AppHeader from '@components/features/header/AppHeader'
import { Sidebar, SidebarProvider } from '@components/ui/sidebar'
import _ from '@lib/translate'
import { Outlet } from 'react-router'

type Props = {}

const WorkspaceLayout = (props: Props) => {
    return (
        <div className='flex flex-col h-full overflow-hidden w-full'>

            <AppHeader title={_("Workspace")} />

            <div className='flex'>
                <SidebarProvider>
                    <ChannelSidebar />
                </SidebarProvider>

                <Outlet />
            </div>

        </div>
    )
}

export default WorkspaceLayout