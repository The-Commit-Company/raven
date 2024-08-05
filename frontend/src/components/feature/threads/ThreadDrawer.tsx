import { Flex, Heading, IconButton } from '@radix-ui/themes'
import { useNavigate, useParams } from 'react-router-dom'
import { ThreadMessages } from './ThreadMessages'
import { IoMdClose } from 'react-icons/io'

const ThreadDrawer = () => {
    const { threadID } = useParams()
    return (
        <Flex direction='column' gap='0' className='w-[120rem] h-[vh] border-l dark:bg-gray-2 bg-white z-[999]'>
            <ThreadHeader />
            <ThreadMessages threadID={threadID ?? ''} />
        </Flex>
    )
}

export const Component = ThreadDrawer

const ThreadHeader = () => {
    const navigate = useNavigate()
    return (
        <header>
            <Flex justify={'between'} align={'center'} className='py-4 border-gray-4 border-b pl-4 pr-2'>
                <Heading size='4'>Thread</Heading>
                <IconButton
                    className='mr-1'
                    variant="ghost"
                    color="gray"
                    aria-label="Close thread"
                    title="Close thread"
                    onClick={() => navigate(-1)}>
                    <IoMdClose size='16' />
                </IconButton>
            </Flex>
        </header>
    )
}