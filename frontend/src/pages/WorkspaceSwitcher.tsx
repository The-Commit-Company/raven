import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Stack } from '@/components/layout/Stack'
import useFetchWorkspaces from '@/hooks/fetchers/useFetchWorkspaces'
import { Flex, Text } from '@radix-ui/themes'
import { Navigate, Outlet } from 'react-router-dom'

const WorkspaceSwitcher = () => {

    const { data, isLoading, error } = useFetchWorkspaces()

    const lastWorkspace = localStorage.getItem('ravenLastWorkspace') ?? ''
    const lastChannel = localStorage.getItem('ravenLastChannel') ?? ''

    const isWorkspaceInData = data?.message.some(w => w.name === lastWorkspace) ?? false

    if (isLoading) {
        return <Flex justify='center' align='center' height='100vh' width='100vw' className='animate-fadein'>
            <Stack className='text-center' gap='1'>
                <Text size='7' className='cal-sans tracking-normal'>raven</Text>
                <Text color='gray' weight='medium'>Setting up your workspace...</Text>
            </Stack>
        </Flex>
    }

    if (error) {
        return <Flex justify='center' align='center' height='100vh' width='100vw'>
            <ErrorBanner error={error} overrideHeading='There was an error while fetching your workspaces.' />
        </Flex>
    }

    if (data && lastWorkspace && lastChannel && isWorkspaceInData) {
        return <Navigate to={`/${lastWorkspace}/${lastChannel}`} replace />
    }

    if (data && data?.message.length === 0) {
        return <Flex justify='center' align='center' height='100vh' width='100vw' className='animate-fadein'>
            <Stack className='text-center' gap='1'>
                <Text size='7' className='cal-sans tracking-normal'>raven</Text>
                <Text color='gray' weight='medium'>You have not set up any workspaces yet.</Text>
            </Stack>
        </Flex>
    }

    if (data && data?.message.length === 1) {
        return <Navigate to={`/${data.message[0].name}`} replace />
    }

    if (data) {
        return <Outlet />
    }

    return <Flex justify='center' align='center' height='100vh' width='100vw' className='animate-fadein'>
        <Stack className='text-center' gap='1'>
            <Text size='7' className='cal-sans tracking-normal'>raven</Text>
            <Text color='gray' weight='medium'>Setting up your workspace...</Text>
        </Stack>
    </Flex>
}

export default WorkspaceSwitcher