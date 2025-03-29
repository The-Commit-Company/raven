import { UserAvatar } from '@/components/common/UserAvatar';
import { getStatusText } from '@/components/feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu';
import { useGetUser } from '@/hooks/useGetUser';
import { useIsUserActive } from '@/hooks/useIsUserActive';
import { Flex, HoverCard, Link, Text } from '@radix-ui/themes';
import { NodeViewRendererProps, NodeViewWrapper } from "@tiptap/react";
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk';
import { BsFillCircleFill } from 'react-icons/bs';
import { toast } from 'sonner';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner';
import OnLeaveBadge from '@/components/common/UserLeaveBadge';


export const UserMentionRenderer = ({ node }: NodeViewRendererProps) => {

    const user = useGetUser(node.attrs.id)
    const isActive = useIsUserActive(node.attrs.id)

    const availabilityStatus = user?.availability_status
    const customStatus = user?.custom_status

    const { call } = useContext(FrappeContext) as FrappeConfig

    const navigate = useNavigate()

    const { workspaceID } = useParams()

    const onClick = () => {
        if (user) {
            call.post('raven.api.raven_channel.create_direct_message_channel', {
                user_id: user?.name
            }).then((res) => {
                navigate(`/${workspaceID}/${res?.message}`)
            }).catch(err => {
                toast.error('Could not create a DM channel', {
                    description: getErrorMessage(err)
                })
            })
        }

    }


    return (
        <NodeViewWrapper as={'span'}>
            <HoverCard.Root>
                <HoverCard.Trigger>
                    <Link size={{
                        sm: '3',
                        md: '2'
                    }} onClick={onClick} className='cursor-pointer'>
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
                            {user && <OnLeaveBadge userID={user.name} />}
                            {customStatus ? <Text className='text-gray-11' size='2'>{customStatus}</Text> : user && <Text className='text-gray-11' size='1'>{user?.name}</Text>}
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



export const ChannelMentionRenderer = ({ node }: NodeViewRendererProps) => {

    return (
        <NodeViewWrapper as={'span'}>
            <Link asChild size={{
                sm: '3',
                md: '2'
            }}>
                <RouterLink to={`/channel/${node.attrs.id}`}>
                    #{node.attrs.label}
                </RouterLink>
            </Link>
        </NodeViewWrapper>
    );
};