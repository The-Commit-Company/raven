import { Button, Flex, Separator, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { RavenThread } from '@/types/RavenMessaging/RavenThread'

interface ThreadPreviewBoxProps {
    thread: RavenThread
}

export const ThreadPreviewBox = ({ thread }: ThreadPreviewBoxProps) => {

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            p-2
            border border-gray-4
            rounded-md">
            <Flex gap='2'>
                <Text as='span' size='1'>{thread.channel_id}</Text>
                <Separator orientation='vertical' />
                <Text as='span' size='1' color='gray'><DateMonthYear date={thread.creation} /></Text>
                <Button size={'1'} variant={'ghost'} className={'not-cal hover:bg-transparent cursor-pointer'}>
                    Open thread
                </Button>
            </Flex>
            <Flex direction='column' gap='2'>

            </Flex>
        </Flex>
    )
}