import { PageHeader } from '@/components/layout/Heading/PageHeader'
import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { BiChevronLeft } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import { ImageUploader } from './UploadImage/ImageUploader'

const UserSettings = () => {
    return (
        <>
            <PageHeader>
                <Flex align='center' gap='3' className="h-8">
                    <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                        <BiChevronLeft size='24' className="block text-gray-12" />
                    </Link>
                    <Heading size='5'>Settings</Heading>
                </Flex>
            </PageHeader>
            <Box className="min-h-screen pt-16 pb-8">
                <Flex direction='column' gap='3' justify='start' px='4'>
                    <Text size="2">Make changes to your account.</Text>
                    <ImageUploader />
                </Flex>
            </Box>
        </>
    )
}

export const Component = UserSettings