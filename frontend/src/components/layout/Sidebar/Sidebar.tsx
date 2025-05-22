import { SidebarHeader } from './SidebarHeader'
import { SidebarBody } from './SidebarBodyCustom'
import { Box, Flex, Separator } from '@radix-ui/themes'
import { HStack } from '../Stack'
import WorkspacesSidebar from './WorkspacesSidebar'
import SidebarContainer from './SidebarContainer'
import { useSidebarMode } from '@/utils/layout/sidebar'

export const Sidebar = () => {
  const { mode } = useSidebarMode()

  return (
    <HStack gap='0' className={`h-screen ${mode}`}>
      <WorkspacesSidebar />
      <SidebarContainer />
      <Flex
        className='border-l border-r border-gray-4 dark:border-gray-6'
        justify='between'
        direction='row'
        gap='2'
        width='100%'
      >
       <Flex direction="column" gap="2" width="100%" style={{ minWidth: '288px' }}>
          <SidebarHeader />
          <Box px='2'>
            <Separator size='4' className='bg-gray-4 dark:bg-gray-6' />
          </Box>
          <SidebarBody />
        </Flex>
      </Flex>
    </HStack>
  )
}
