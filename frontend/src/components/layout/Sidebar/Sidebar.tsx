import { SidebarHeader } from './SidebarHeader'
import { SidebarBody } from './SidebarBodyCustom'
import { Box, Flex, Separator } from '@radix-ui/themes'
import { HStack } from '../Stack'
import WorkspacesSidebar from './WorkspacesSidebar'
import SidebarContainer from './SidebarContainer'
import { useSidebarMode } from '@/utils/layout/sidebar'

import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

export const Sidebar = () => {
  const { mode } = useSidebarMode()

  return (
    <HStack gap='0' className={`h-screen ${mode}`}>
      <WorkspacesSidebar />
      <PanelGroup direction='horizontal' className='flex-1 flex'>
        <Panel maxSize={24} defaultSize={24} className='flex'>
          <SidebarContainer />
        </Panel>
        <PanelResizeHandle className='cursor-col-resize' />
        <Panel minSize={35} className='border-l border-r border-gray-400 dark:border-gray-600'>
          <div className='flex flex-col gap-2 w-full min-w-[288px]'>
            <SidebarHeader />
            <div className='px-2'>
              <div className='h-px bg-gray-400 dark:bg-gray-600' />
            </div>
            <SidebarBody />
          </div>
        </Panel>
      </PanelGroup>
    </HStack>
  )
}
