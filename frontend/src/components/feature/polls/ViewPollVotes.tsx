import { useFrappeGetCall } from 'frappe-react-sdk'
import { Poll } from '../chat/ChatMessage/Renderers/PollMessage'
import { useState } from 'react'
import { Button, Dialog, Flex, ScrollArea, Separator, Text } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import clsx from 'clsx'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'

type VoteData = {
    users: string[]
    count: number
    percentage: number
}

type PollVotesResponse = Record<string, VoteData>

interface ViewPollVotesProps {
    poll: Poll
}

export const ViewPollVotes = ({ poll }: ViewPollVotesProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()
    const buttonText = poll.poll.is_disabled ? 'View Results' : 'View Votes'

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>

                <Dialog.Trigger>
                    <Button variant='ghost' size={'1'} className='-mb-2.5 bg-transparent hover:text-accent-10 w-full'>{buttonText}</Button>
                </Dialog.Trigger>

                <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'max-h-[80vh]')}>
                    <ViewPollVotesModalContent
                        onClose={onClose}
                        poll={poll} />
                </Dialog.Content>

            </Dialog.Root>
        )
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <Separator className='w-full' />
            <DrawerTrigger asChild>
                <Button variant='ghost' size={'1'} className='bg-transparent hover:text-accent-10 w-full'>{buttonText}</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className='h-[80vh]'>
                    <ViewPollVotesModalContent
                        onClose={onClose}
                        poll={poll} />
                </div>
            </DrawerContent>
        </Drawer>
    }


}

interface ViewPollVotesModalContentProps {
    onClose: () => void,
    poll: Poll
}

const ViewPollVotesModalContent = ({ onClose, poll }: ViewPollVotesModalContentProps) => {

    // fetch poll votes using poll_id
    const { data, error } = useFrappeGetCall<{ message: PollVotesResponse }>('raven.api.raven_poll.get_all_votes', {
        'poll_id': poll.poll.name,
    }, `poll_votes_${poll.poll.name}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return (
        <Flex direction={'column'} gap={'2'}>
            <ErrorBanner error={error} />
            {data && data.message && <VotesBlock votesData={data.message} poll={poll} />}
        </Flex>
    )
}

const VotesBlock = ({ votesData, poll }: { votesData: PollVotesResponse, poll: Poll }) => {
    return (
        <Flex direction={'column'}>
            <Dialog.Title>
                <Flex justify={'between'} align={'baseline'}>
                    <Text>Poll Votes</Text>
                    <Text size={'2'} color='gray' className='not-cal'>{poll.poll.total_votes} votes</Text>
                </Flex>
            </Dialog.Title>

            <Separator className='w-full' />
            <ScrollArea className='h-[76vh]' type='scroll'>
                <Flex direction={'column'} className='py-4 pr-3' gap={'2'}>
                    <Text size={'3'} weight={'bold'}>{poll.poll.question}</Text>
                    {votesData && Object.keys(votesData).map((opt) => {
                        const option = votesData[opt]
                        const optionName = poll.poll.options.find(o => o.name === opt)?.option
                        return (
                            <div>
                                <div key={opt} className='flex items-center justify-between py-2'>
                                    <Flex>
                                        <Text size='1'>{optionName}</Text>
                                        <Text size='1' color='gray' className='ml-1'>- {option.percentage.toFixed(2)}%</Text>
                                    </Flex>
                                    <Text size='1' color='gray'>{option.count} vote{option.count > 1 ? 's' : ''}</Text>
                                </div>
                                <Flex direction={'column'} gap={'2'} className='bg-gray-100 dark:bg-gray-3 rounded-md py-2 px-2'>
                                    {option.users.map((user) => {
                                        return <div key={user} className='group'>
                                            <UserVote user_id={user} />
                                        </div>
                                    })}
                                </Flex>
                            </div>
                        )
                    })}
                </Flex>
            </ScrollArea>
        </Flex>
    )
}

const UserVote = ({ user_id }: { user_id: string }) => {

    const user = useGetUser(user_id)

    return <Flex gap={'2'}>
        <UserAvatar alt={user?.full_name} src={user?.user_image} size='2' />
        <div className='flex flex-col text-ellipsis justify-center border-b border-gray-6 w-full pb-2 group-last:pb-0 group-last:border-b-0'>
            <Text as='span' className='block' weight='medium' size='2'>{user?.full_name}</Text>
        </div>
    </Flex>
}