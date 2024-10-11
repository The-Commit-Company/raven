import { Stack } from '@/components/layout/Stack'
import { Button, Flex, Heading, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

type Props = {}

const NotFoundPage = (props: Props) => {
    return (
        <Flex className='h-screen w-screen bg-gray-2' align='center' justify='center'>
            <Stack gap='4'>
                <Heading as='h1' size='5' className='text-center not-cal'>Page not found.</Heading>
                <Text>You have ventured too far beyond the wall.</Text>

                <Button variant='ghost' size='3' asChild className='not-cal hover:bg-transparent hover:text-accent-12'>
                    <Link to='/'>Go Back</Link>
                </Button>
            </Stack>
        </Flex>
    )
}

export const Component = NotFoundPage