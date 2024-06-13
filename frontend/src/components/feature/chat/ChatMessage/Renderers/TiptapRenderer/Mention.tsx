import { UserAvatar } from '@/components/common/UserAvatar';
import { getStatusText } from '@/components/feature/userSettings/SetUserAvailabilityMenu';
import { useGetUser } from '@/hooks/useGetUser';
import { useIsUserActive } from '@/hooks/useIsUserActive';
import { Flex, HoverCard, Link, Text } from '@radix-ui/themes';
import Mention from '@tiptap/extension-mention'
import { NodeViewRendererProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { BsFillCircleFill } from 'react-icons/bs';
import { Link as RouterLink } from 'react-router-dom';

export const CustomUserMention = Mention.extend({
    name: 'userMention',
    addNodeView() {
        return ReactNodeViewRenderer(UserMentionRenderer)
    }
})

export const CustomChannelMention = Mention.extend({
    name: 'channelMention',
    addNodeView() {
        return ReactNodeViewRenderer(ChannelMentionRenderer)
    }
})

const UserMentionRenderer = ({ node }: NodeViewRendererProps) => {

    const user = useGetUser(node.attrs.id)
    const isActive = useIsUserActive(node.attrs.id)

    const availabilityStatus = user?.availability_status
    const customStatus = user?.custom_status

    return (
        <NodeViewWrapper as={'span'}>
            <HoverCard.Root>
                <HoverCard.Trigger>
                    <Link size='2'>
                        @{user?.full_name ?? node.attrs.label}
                    </Link>
                </HoverCard.Trigger>
                <HoverCard.Content size='1'>
                    <Flex gap='2' align='center'>
                        <UserAvatar src={user?.user_image} alt={user?.full_name ?? node.attrs.label} size='4' />
                        <Flex direction='column'>
                            <Flex gap='3' align='center'>
                                <Text className='text-gray-12' weight='bold' size='3'>{user?.full_name ?? node.attrs.label}</Text>
                                {/* if availabilityStatus is set to 'Invisible', don't show the status */}
                                {availabilityStatus && availabilityStatus !== 'Invisible' && <Flex className='text-gray-10 text-xs flex gap-1 items-center'>
                                    {getStatusText(availabilityStatus)}
                                </Flex>}
                                {/* only show user active status if the user has not explicitly set their availability status */}
                                {!availabilityStatus && isActive && <Flex gap='1' align='center'>
                                    <BsFillCircleFill color={'green'} size='8' />
                                    <Text className='text-gray-10' size='1'>Online</Text>
                                </Flex>}
                            </Flex>
                            {customStatus ? <Text className='text-gray-11' size='1'>{customStatus}</Text> : user && <Text className='text-gray-11' size='1'>{user?.name}</Text>}
                        </Flex>
                    </Flex>
                </HoverCard.Content>
            </HoverCard.Root>
            {/* <Link>
                @{node.attrs.label}
            </Link> */}
        </NodeViewWrapper>
    );
};



const ChannelMentionRenderer = ({ node }: NodeViewRendererProps) => {


    return (
        <NodeViewWrapper as={'span'}>
            <Link asChild>
                <RouterLink to={`/channels/${node.attrs.id}`}>
                    @{node.attrs.label}
                </RouterLink>
            </Link>
        </NodeViewWrapper>
    );
};