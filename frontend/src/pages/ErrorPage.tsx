import { HStack, Stack } from '@/components/layout/Stack'
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button, Code, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { useNavigate, useRouteError } from 'react-router-dom'

const ErrorPage = () => {

    let error = useRouteError();

    const errorDueToUpdate = (error as Error).message?.includes('Failed to fetch dynamically imported module:')
        || (error as Error).message?.includes('Importing a module script failed.')
        || (error as Error).message?.includes('error loading dynamically imported module')

    const navigate = useNavigate()

    const reloadPage = () => {
        navigate(0)
    }

    const isMobile = useIsMobile()

    const goToChannels = () => {

        if (isMobile) {
            navigate('/')
        } else {
            const lastWorkspace = localStorage.getItem('ravenLastWorkspace')
            const ravenLastChannel = localStorage.getItem('ravenLastChannel')

            if (lastWorkspace && ravenLastChannel) {
                navigate(`/${lastWorkspace}/${ravenLastChannel}`)
            } else if (lastWorkspace) {
                navigate(`/${lastWorkspace}`)
            } else {
                navigate('/')
            }
        }
    }

    return (
        <Flex className='h-screen w-screen bg-gray-2' align='center' justify='center'>
            <Stack gap='4'>
                <Heading as='h1' size='5' className='text-center not-cal'>{errorDueToUpdate ?
                    "A new update is available." :
                    "There was an unexpected error."}
                </Heading>
                <Text>If you face this error again, please report it either on <Link target='_blank' href='https://github.com/The-Commit-Company/raven/issues'>GitHub</Link> or <Link target='_blank' href='https://support.ravenchat.ai/'> our support portal</Link>.</Text>

                {!errorDueToUpdate && <details>
                    <summary><Text size='2'>Show error details</Text></summary>
                    <Code color='gray'>{(error as Error).message}</Code>
                </details>
                }
                <HStack justify='center'>
                    <Button
                        size='2'
                        className='not-cal'
                        onClick={reloadPage}>
                        {errorDueToUpdate ? "Upgrade to a better experience" : "Reload the Page"}
                    </Button>
                    {!errorDueToUpdate && <Button
                        variant='soft'
                        color='gray'
                        size='2' className='not-cal' onClick={goToChannels}>
                        Back to Channels
                    </Button>
                    }
                </HStack>

            </Stack>
        </Flex>
    )
}

export default ErrorPage