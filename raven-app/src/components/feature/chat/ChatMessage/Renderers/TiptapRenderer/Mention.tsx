import { UserAvatar } from '@/components/common/UserAvatar';
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

    return (
        <NodeViewWrapper as={'span'}>
            <HoverCard.Root>
                <HoverCard.Trigger>
                    <Link size='2'>
                        @{user?.full_name ?? node.attrs.label}
                    </Link>
                </HoverCard.Trigger>
                <HoverCard.Content>
                    <Flex gap='2' align='center'>
                        <UserAvatar src={user?.user_image} alt={user?.full_name ?? node.attrs.label} size='4' />
                        <Flex direction='column'>
                            <Flex gap='3' align='center'>
                                <Text className='text-gray-12' weight='bold' size='3'>{user?.full_name ?? node.attrs.label}</Text>
                                {isActive && <Flex gap='1' align='center'>
                                    <BsFillCircleFill className='text-green-400' size='8' />
                                    <Text className='text-gray-10' size='1'>Online</Text>
                                </Flex>}
                            </Flex>
                            {user && <Text className='text-gray-11' size='1'>{user?.name}</Text>}
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

    // console.log(node)
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