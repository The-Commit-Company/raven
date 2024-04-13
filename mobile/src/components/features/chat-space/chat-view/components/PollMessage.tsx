import { useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Checkbox, Flex, RadioGroup, Separator, Text } from '@radix-ui/themes'
import { useFrappeDocumentEventListener, useFrappeGetCall, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { RavenPoll } from '@/types/RavenMessaging/RavenPoll'
import { RavenPollOption } from '@/types/RavenMessaging/RavenPollOption'
import { PollMessage } from '../../../../../../../types/Messaging/Message'
import { ViewPollVotes } from '@/components/features/polls/ViewPollVotes'

export interface Poll {
    'poll': RavenPoll,
    'current_user_votes': { 'option': string }[]
}

const PollMessageBlock = ({ message, onModalClose, onModalOpen }: { message: PollMessage, onModalOpen: VoidFunction, onModalClose: VoidFunction }) => {

    const { mutate: globalMutate } = useSWRConfig()
    // fetch poll data using message_id
    const { data, error, mutate } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message.name,
    }, `poll_data_${message.poll_id}`, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true
    })

    useFrappeDocumentEventListener('Raven Poll', message.poll_id, () => {
        mutate()
        globalMutate(`poll_votes_${message.poll_id}`)
    })

    return (
        <div className='py-1.5 rounded-lg'>
            {data && <PollMessageBox
                data={data.message}
                messageID={message.name}
                onModalOpen={onModalOpen}
                onModalClose={onModalClose}
            />}
        </div>
    )
}

export default PollMessageBlock

const PollMessageBox = ({ data, messageID, onModalClose, onModalOpen }: { data: Poll, messageID: string, onModalOpen: VoidFunction, onModalClose: VoidFunction }) => {

    const [isOpen, setOpen] = useState<boolean>(false)
    const onViewClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        setOpen(true)
        onModalOpen()
    }

    const closeModal = () => {
        setOpen(false)
        onModalClose()
    }
    return (
        <Flex align='center' direction='column' className="bg-gray-2
        shadow-sm
        dark:bg-gray-3
        group-hover:bg-accent-a2
        dark:group-hover:bg-gray-4
        group-hover:transition-all
        group-hover:delay-100
        min-w-64
        w-full
        rounded-md">
            <Flex direction='column' gap='3' p='4' className="w-full">
                <Flex direction='column' gap='2'>
                    <Text size='2' weight={'medium'}>
                        {data.poll.question}
                    </Text>
                    {data.poll.is_anonymous ? <Badge color='blue' className={'w-fit'}>Anonymous</Badge> : null}
                </Flex>
                {data.current_user_votes.length > 0 ?
                    <PollResults data={data} /> :
                    <>
                        {data.poll.is_multi_choice ?
                            <MultiChoicePoll data={data} messageID={messageID} /> :
                            <SingleChoicePoll data={data} messageID={messageID} />
                        }
                    </>
                }
                {data.poll.is_disabled ? <Badge color="gray" className={'w-fit'}>Poll is now closed</Badge> : null}
            </Flex>
            {data.poll.is_anonymous ? null :
                <>
                    <Separator size='4' />
                    <Flex pt='3' pb='3'>
                        <Button variant='ghost'
                            onClick={onViewClick}
                            className='hover:bg-transparent hover:text-accent-10 w-full'>View Votes</Button>
                    </Flex>
                    <ViewPollVotes isOpen={isOpen} onDismiss={closeModal} poll={data} />
                </>
            }
        </Flex>
    )
}

const PollResults = ({ data }: { data: Poll }) => {
    return (
        <Flex direction='column' gap='2' className="w-full">
            {data.poll.options.map(option => {
                return <PollOption key={option.name} data={data} option={option} />
            })}
            <Text as='span' size='1' color='gray' className="px-2">{data.poll.total_votes} vote{data.poll.total_votes > 1 ? 's' : ''}</Text>
        </Flex>
    )
}

const PollOption = ({ data, option }: { data: Poll, option: RavenPollOption }) => {


    // State to track whether the animation should be triggered
    const [triggerAnimation, setTriggerAnimation] = useState<boolean>(false)

    // Use useEffect to trigger animation after the component is mounted
    useEffect(() => {
        setTriggerAnimation(true)
    }, [data])

    const isCurrentUserVote = useMemo(() => {
        return data.current_user_votes.some(vote => vote.option === option.name)
    }, [data.current_user_votes, option.name])

    const percentage = useMemo(() => {

        const getPercentage = (votes: number) => {
            if (data.poll.is_multi_choice) {
                const totalVotes = data.poll.options.reduce((acc, opt) => acc + (opt.votes ?? 0), 0)
                return (votes / totalVotes) * 100
            } else return (votes / data.poll.total_votes) * 100
        }


        return getPercentage(option.votes ?? 0)
    }, [option.votes, data])

    const width = `${percentage}%`

    return (
        <Flex key={option.name} justify='between' align='center' width='100%' className={'relative'}>
            <Box position='absolute' top='0' left='0'
                data-is-current-user-vote={isCurrentUserVote}
                className={`bg-gray-5
                            dark:bg-gray-6
                            h-full
                            rounded-sm
                            data-[is-current-user-vote=true]:bg-accent-a5
                            dark:data-[is-current-user-vote=true]:bg-accent-a6`}
                style={{ width: triggerAnimation ? width : 0, transition: 'width 0.5s ease-in-out' }}>
            </Box>
            <Text as='span' size='2' className="px-2 py-1 z-10" weight={isCurrentUserVote ? 'bold' : 'regular'}>{option.option}</Text>
            <Text as='span' size='2' className="px-2 py-1 z-10" weight={isCurrentUserVote ? 'bold' : 'regular'}>{percentage.toFixed(1)}%</Text>
        </Flex>
    )
}

const SingleChoicePoll = ({ data, messageID }: { data: Poll, messageID: string }) => {

    const { mutate } = useSWRConfig()
    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote')
    const onVoteSubmit = async (option: RavenPollOption) => {
        return call({
            'message_id': messageID,
            'option_id': option.name
        }).then(() => {
            mutate(`poll_data_${data.poll.name}`)
        })
    }

    return (
        <RadioGroup.Root>
            {data.poll.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <RadioGroup.Item disabled={data.poll.is_disabled ? true : false} value={option.name} onClick={() => onVoteSubmit(option)} />
                            {option.option}
                        </Flex>
                    </Text>
                </div>
            ))}
        </RadioGroup.Root>
    )
}

const MultiChoicePoll = ({ data, messageID }: { data: Poll, messageID: string }) => {

    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const { mutate } = useSWRConfig()

    const handleCheckboxChange = (name: string, value: boolean | string) => {
        if (value) {
            setSelectedOptions((opts) => [...opts, name])
        } else {
            setSelectedOptions((opts) => opts.filter(opt => opt !== name))
        }
    }

    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote')
    const onVoteSubmit = async () => {
        return call({
            'message_id': messageID,
            'option_id': selectedOptions
        }).then(() => {
            mutate(`poll_data_${data.poll.name}`)
        })
    }

    return (
        <div>
            {data.poll.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <Checkbox disabled={data.poll.is_disabled ? true : false} value={option.name} onCheckedChange={(v) => handleCheckboxChange(option.name, v)} />
                            {option.option}
                        </Flex>
                    </Text>
                </div>
            ))}
            <Flex justify={'between'} align={'center'} gap={'2'}>
                <Text size='1' className="text-gray-500">To view the poll results, please submit your choice(s)</Text>
                <Button disabled={data.poll.is_disabled ? true : false} size={'1'} variant={'soft'} style={{ alignSelf: 'flex-end' }} onClick={onVoteSubmit}>Submit</Button>
            </Flex>
        </div>
    )
}