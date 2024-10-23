import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { HStack, Stack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { Flex, Text } from '@radix-ui/themes'

type Props = {}

const MobileTabsPage = (props: Props) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Flex align={'center'} justify={'center'} className='h-screen'>
            <Stack gap='4'>
                <HStack justify='center' className='text-gray-11'>
                    <ChannelIcon type='Public' size='32' />
                    <ChannelIcon type='Open' size='32' />
                    <ChannelIcon type='Private' size='32' />
                </HStack>
                <Text size='3' weight='medium' color='gray'>Select a channel from the sidebar to view it's messages</Text>
            </Stack>

        </Flex>
    }


    return (
        <Sidebar />
    )
}

export default MobileTabsPage