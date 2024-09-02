import { useNavigate, useParams } from "react-router-dom"
import { DropdownMenu, Flex, Heading, IconButton } from "@radix-ui/themes"
import { BiBell, BiBellOff, BiDotsVerticalRounded, BiExit } from "react-icons/bi"
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { AiOutlineClose } from "react-icons/ai"
import { useUserData } from "@/hooks/useUserData"
import useFetchChannelMembers, { Member } from "@/hooks/fetchers/useFetchChannelMembers"
import { useMemo } from "react"
import useIsPushNotificationEnabled from "@/hooks/fetchers/useIsPushNotificationEnabled"

export const ThreadHeader = () => {

    const navigate = useNavigate()

    const { threadID } = useParams()

    const { name: user } = useUserData()
    const { channelMembers } = useFetchChannelMembers(threadID ?? '')

    const channelMember = useMemo(() => {
        if (user && channelMembers) {
            return channelMembers[user] ?? null
        }
        return null
    }, [user, channelMembers])


    return (
        <header className='dark:bg-gray-2 bg-white fixed top-0 px-3 sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)] w-screen' style={{ zIndex: 999 }}>
            <Flex direction={'column'} gap='2' className='pt-3'>
                <Flex justify={'between'} align={'center'}>
                    <Heading size='4' className='pl-1'>Thread</Heading>
                    <Flex gap='2' justify={'between'} align={'center'} className="px-4 sm:px-0">
                        {channelMember &&
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <IconButton color='gray' className='bg-transparent text-gray-12 hover:bg-gray-3'>
                                        <BiDotsVerticalRounded />
                                    </IconButton>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content className='min-w-48'>
                                    <ToggleNotificationButton channelMember={channelMember} />
                                    <LeaveThreadButton />
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        }
                        <IconButton
                            className='mr-1 text-gray-11'
                            variant="ghost"
                            color="gray"
                            aria-label="Close thread"
                            title="Close thread"
                            onClick={() => navigate('../', { replace: true })}>
                            <AiOutlineClose size='16' />
                        </IconButton>
                    </Flex>
                </Flex>
            </Flex>
        </header>
    )
}


const LeaveThreadButton = () => {

    const { threadID } = useParams()
    const { mutate } = useSWRConfig()
    const navigate = useNavigate()

    const { call } = useFrappePostCall('raven.api.raven_channel.leave_channel')

    const onLeaveThread = () => {

        const promise = call({ channel_id: threadID }).then(() => {
            navigate('../')
            mutate(["channel_members", threadID])

            return Promise.resolve()
        })

        toast.promise(promise, {
            success: 'You have left the thread',
            error: (e) => `Could not leave thread - ${getErrorMessage(e)}`
        })
    }

    return (
        <DropdownMenu.Item onClick={onLeaveThread} color="red">
            <Flex gap='2' align='center'>
                <BiExit size={'16'} />
                Leave Thread
            </Flex>
        </DropdownMenu.Item>
    )
}

const ToggleNotificationButton = ({ channelMember }: { channelMember: Member }) => {

    const { threadID } = useParams()
    const { mutate } = useSWRConfig()

    const isPushAvailable = useIsPushNotificationEnabled()

    const { call } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

    const onToggle = () => {
        if (channelMember) {
            const promise = call({
                member: channelMember?.channel_member_name,
                allow_notifications: channelMember?.allow_notifications ? 0 : 1
            })
                .then((res) => {
                    if (res && res.message) {
                        mutate(["channel_members", threadID], (existingMembers: any) => {
                            return {
                                message: {
                                    ...existingMembers.message,
                                    [channelMember.name]: {
                                        ...existingMembers.message[channelMember.name],
                                        allow_notifications: res.message.allow_notifications
                                    }
                                }
                            }
                        }, {
                            revalidate: false
                        })
                    }

                    return Promise.resolve()
                })

            toast.promise(promise, {
                success: 'Notification settings updated',
                error: 'Failed to update notification settings'
            })
        }
    }

    if (!isPushAvailable) return null

    return (
        <DropdownMenu.Item onClick={onToggle}>
            <Flex gap='2' align='center'>
                {channelMember.allow_notifications ? <BiBellOff size={'16'} /> : <BiBell size={'16'} />}
                {channelMember.allow_notifications ? 'Disable' : 'Enable'} Notifications
            </Flex>
        </DropdownMenu.Item>
    )
}