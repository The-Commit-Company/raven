import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { Avatar, Card, Grid, Heading, Text } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useMemo } from 'react'
import { MdArrowOutward } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getErrorMessage } from './AlertBanner/ErrorBanner'
import { HStack, Stack } from './Stack'

const WorkspaceSwitcherGrid = () => {
  const { data } = useFetchWorkspaces()

  const { myWorkspaces, otherWorkspaces } = useMemo(() => {
    const myWorkspaces: WorkspaceFields[] = []
    const otherWorkspaces: WorkspaceFields[] = []

    if (data?.message?.length) {
      data.message.forEach((workspace) => {
        if (workspace?.workspace_member_name) {
          myWorkspaces.push(workspace)
        } else {
          otherWorkspaces.push(workspace)
        }
      })
    }

    return { myWorkspaces, otherWorkspaces }
  }, [data])

  return (
    <Stack className='sm:p-28 py-16 sm:px-8 px-4 gap-16 animate-fadein'>
      <div className='container flex mx-auto flex-col gap-5 max-w-screen-lg'>
        <Stack gap='1'>
          <Heading className='not-cal' size='4'>
            My Workspaces
          </Heading>
          <Text size='2' color='gray' weight='medium'>
            Switch between workspaces that you are a member of.
          </Text>
        </Stack>
        <Grid columns={{ sm: '1', md: '3', lg: '3', xl: '3' }} gap='4'>
          {myWorkspaces?.map((workspace) =>
            workspace?.name ? <MyWorkspaceItem key={workspace.name} workspace={workspace} /> : null
          )}
        </Grid>
      </div>

      {otherWorkspaces?.length > 0 && (
        <div className='container flex mx-auto flex-col gap-5 max-w-screen-lg'>
          <Stack gap='1'>
            <Heading className='not-cal' size='4'>
              Other Workspaces
            </Heading>
            <Text size='2' color='gray' weight='medium'>
              Explore other workspaces that you can join.
            </Text>
          </Stack>
          <Grid columns={{ sm: '1', md: '3', lg: '3', xl: '3' }} gap='4'>
            {otherWorkspaces.map((workspace) =>
              workspace?.name ? <OtherWorkspaceItem key={workspace.name} workspace={workspace} /> : null
            )}
          </Grid>
        </div>
      )}
    </Stack>
  )
}

const WorkspaceMemberCount = ({ workspace }: { workspace: string }) => {
  const { data } = useFrappeGetCall('raven.api.workspaces.get_workspace_member_count', { workspace })

  if (data?.message === undefined || data?.message === null) return null

  const count = data.message

  return (
    <Text size='2' as='span' color='gray' weight='medium'>
      {count === 0 ? 'No members' : count === 1 ? '1 solo member' : `${count} members`}
    </Text>
  )
}

const getLogo = (workspace: WorkspaceFields) => {
  let logo = workspace?.logo || ''

  if (!logo && workspace?.workspace_name === 'Raven') {
    logo = '/assets/raven/raven-logo.png'
  }

  return logo
}

const MyWorkspaceItem = ({ workspace }: { workspace: WorkspaceFields }) => {
  const logo = getLogo(workspace)

  const openWorkspace = () => {
    if (workspace?.name) {
      localStorage.setItem('ravenLastWorkspace', workspace.name)
      localStorage.removeItem('ravenLastChannel')
    }
  }

  return (
    <Card asChild className='shadow-sm hover:scale-105 transition-all duration-200'>
      <Link
        aria-label={`Switch to ${workspace?.workspace_name ?? 'workspace'}`}
        to={`/${workspace?.name}`}
        onClick={openWorkspace}
      >
        <HStack>
          <Avatar
            size={{ sm: '4', md: '4' }}
            className='hover:shadow-sm transition-all duration-200'
            color='gray'
            fallback={workspace?.workspace_name?.charAt(0) ?? 'W'}
            src={logo}
          />
          <Stack className='gap-0.5'>
            <Heading as='h3' size='3' className='not-cal font-semibold'>
              {workspace?.workspace_name ?? 'Unnamed'}
            </Heading>
            <Text size='2' color='gray' weight='medium' as='span'>
              {workspace?.type === 'Public' ? 'Public' : 'Private'}
            </Text>
            {workspace?.description && (
              <Text as='p' size='2' color='gray' className='line-clamp-2 text-ellipsis'>
                {workspace.description}
              </Text>
            )}
          </Stack>
        </HStack>
      </Link>
    </Card>
  )
}

const OtherWorkspaceItem = ({ workspace }: { workspace: WorkspaceFields }) => {
  const logo = getLogo(workspace)
  const { call } = useFrappePostCall('raven.api.workspaces.join_workspace')
  const { mutate } = useSWRConfig()

  const joinWorkspace = () => {
    if (!workspace?.name) return

    toast.promise(
      call({ workspace: workspace.name }).then(() => {
        mutate('workspaces_list')
        mutate('channel_list')
      }),
      {
        loading: 'Joining workspace...',
        success: 'You have joined the workspace.',
        error: (error) => `There was an error while joining the workspace.\n${getErrorMessage(error)}`
      }
    )
  }

  return (
    <Card className='relative shadow-sm hover:scale-105 transition-all duration-200'>
      <HStack
        role='button'
        onClick={joinWorkspace}
        title={`Join ${workspace?.workspace_name ?? 'workspace'}`}
        aria-label={`Join ${workspace?.workspace_name ?? 'workspace'}`}
      >
        <Avatar
          size={{ sm: '4', md: '4' }}
          className='hover:shadow-sm transition-all duration-200'
          color='gray'
          fallback={workspace?.workspace_name?.charAt(0) ?? 'W'}
          src={logo}
        />
        <Stack className='gap-0.5'>
          <Heading as='h3' size='3' className='not-cal font-semibold'>
            {workspace?.workspace_name ?? 'Unnamed'}
          </Heading>
          {workspace?.name && <WorkspaceMemberCount workspace={workspace.name} />}
          {workspace?.description && (
            <Text as='p' size='2' color='gray' className='line-clamp-2 text-ellipsis'>
              {workspace.description}
            </Text>
          )}
        </Stack>
      </HStack>
      <div className='absolute top-0 right-0 p-3'>
        <MdArrowOutward />
      </div>
    </Card>
  )
}

export default WorkspaceSwitcherGrid
