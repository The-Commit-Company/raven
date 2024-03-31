import { Box, Checkbox, Flex, Text, RadioGroup, Button } from "@radix-ui/themes"
import { BoxProps } from "@radix-ui/themes/dist/cjs/components/box"
import { memo, useEffect, useMemo, useState } from "react"
import { UserFields } from "../../../../../utils/users/UserListProvider"
import { PollMessage } from "../../../../../../../types/Messaging/Message"
import { useFrappeDocumentEventListener, useFrappeGetCall, useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { RavenPoll } from "@/types/RavenMessaging/RavenPoll"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { RavenPollOption } from "@/types/RavenMessaging/RavenPollOption"
import { useToast } from "@/hooks/useToast"

interface PollMessageBlockProps extends BoxProps {
    message: PollMessage,
    user?: UserFields,
}

interface Poll {
    'poll': RavenPoll,
    'current_user_votes': { 'option': string }[]
}

export const PollMessageBlock = memo(({ message, user, ...props }: PollMessageBlockProps) => {

    // fetch poll data using message_id
    const { data, error, mutate } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message.name,
    }, `poll_data_${message.poll_id}`, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    })

    useFrappeDocumentEventListener('Raven Poll', message.poll_id, () => {
        mutate()
    })

    return (
        <Box {...props} pt='1'>
            <ErrorBanner error={error} />
            {data && <PollMessageBox data={data.message} messageID={message.name} />}
        </Box>
    )
})

const PollMessageBox = ({ data, messageID }: { data: Poll, messageID: string }) => {
    return (
        <Flex align='center' gap='4' p='2' className="bg-gray-2 
        shadow-sm
        dark:bg-gray-3
        group-hover:bg-accent-a2
        dark:group-hover:bg-gray-4  
        group-hover:transition-all
        group-hover:delay-100
        min-w-64 
        w-full
        rounded-md">
            <Flex direction='column' gap='2' p='2' className="w-full">
                <Text size='2' weight={'medium'}>{data.poll.question}</Text>
                {data.current_user_votes.length > 0 ?
                    <PollResults data={data} /> :
                    <>
                        {data.poll.is_multi_choice ?
                            <MultiChoicePoll data={data} messageID={messageID} /> :
                            <SingleChoicePoll data={data} messageID={messageID} />
                        }
                    </>
                }
            </Flex>
        </Flex>
    )
}

const PollResults = ({ data }: { data: Poll }) => {
    return (
        <Flex direction='column' gap='2' className="w-full">
            {data.poll.options.map(option => {
                return <PollOption key={option.name} data={data} option={option} />
            })}
            <Text as='span' size='1' color='gray' className="px-2">{data.poll.total_votes} votes</Text>
        </Flex>
    )
}

const PollOption = ({ data, option }: { data: Poll, option: RavenPollOption }) => {

    const getPercentage = (votes: number) => {
        return (votes / data.poll.total_votes) * 100
    }

    // State to track whether the animation should be triggered
    const [triggerAnimation, setTriggerAnimation] = useState<boolean>(false)

    // Use useEffect to trigger animation after the component is mounted
    useEffect(() => {
        setTriggerAnimation(true)
    }, [])

    const isCurrentUserVote = useMemo(() => {
        return data.current_user_votes.some(vote => vote.option === option.name)
    }, [data.current_user_votes, option.name])

    const percentage = useMemo(() => {
        return getPercentage(option.votes ?? 0)
    }, [option.votes])

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
    const { toast } = useToast()
    const onVoteSubmit = async (option: RavenPollOption) => {
        return call({
            'message_id': messageID,
            'option_id': option.name
        }).then(() => {
            mutate(`poll_data_${data.poll.name}`)
            toast({
                title: "Your vote has been submitted!",
                variant: 'success',
                duration: 800
            })
        })
    }

    return (
        <RadioGroup.Root>
            {data.poll.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <RadioGroup.Item value={option.name} onClick={() => onVoteSubmit(option)} />
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
    const { toast } = useToast()

    const handleCheckboxChange = (name: string, value: boolean | string) => {
        if (value) {
            setSelectedOptions((opts) => [...opts, name])
        }
    }

    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote')
    const onVoteSubmit = async () => {
        console.log('selected options:', selectedOptions)
        return call({
            'message_id': messageID,
            'option_id': selectedOptions
        }).then(() => {
            mutate(`poll_data_${data.poll.name}`)
            toast({
                title: "Your vote has been submitted!",
                variant: 'success',
                duration: 800
            })
        })
    }

    return (
        <div>
            {data.poll.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <Checkbox value={option.name} checked={selectedOptions.includes(option.name)} onCheckedChange={(v) => handleCheckboxChange(option.name, v)} />
                            {option.option}
                        </Flex>
                    </Text>
                </div>
            ))}
            <Flex justify={'between'} align={'center'} gap={'2'}>
                <Text size='1' className="text-gray-500">To view the poll results, please submit your choice(s)</Text>
                <Button size={'1'} variant={'soft'} style={{ alignSelf: 'flex-end' }} onClick={onVoteSubmit}>Submit</Button>
            </Flex>
        </div>
    )
}