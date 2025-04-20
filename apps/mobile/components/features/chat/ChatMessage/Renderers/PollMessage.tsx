import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFrappeDocumentEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Checkbox } from '@components/nativewindui/Checkbox';
import ViewPollVotes from '@components/features/polls/ViewPollVotes';
import { Text } from '@components/nativewindui/Text';
import { RavenPoll } from '@raven/types/RavenMessaging/RavenPoll';
import { RavenPollOption } from '@raven/types/RavenMessaging/RavenPollOption';
import { useColorScheme } from "@hooks/useColorScheme"
import { PollMessage } from '@raven/types/common/Message';
import { toast } from 'sonner-native';
import { Button } from '@components/nativewindui/Button';
import ErrorBanner from '@components/common/ErrorBanner';

type PollMessageBlockProps = {
    message: PollMessage,
}

export interface Poll {
    'poll': RavenPoll,
    'current_user_votes': { 'option': string }[]
}

export const PollMessageBlock = ({ message, ...props }: PollMessageBlockProps) => {

    const { data, error, mutate } = useFrappeGetCall<{ message: Poll }>(
        'raven.api.raven_poll.get_poll',
        {
            message_id: message.name,
        },
        `poll_data_${message.poll_id}`,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    useFrappeDocumentEventListener('Raven Poll', message.poll_id, () => {
        mutate();
    });

    return (
        <View className='w-full pt-0.5' {...props}>
            {error && <ErrorBanner error={error} />}
            {data ? <PollMessageBox data={data.message} messageID={message.name} /> : null}
        </View>
    );
};

const PollMessageBox = ({ data, messageID }: { data: Poll; messageID: string }) => {
    return (
        <View className="bg-card/80 rounded-xl p-3">
            <View className="flex-col gap-1 pb-3">
                <Text className="text-base font-medium">{data.poll.question} {data.poll.is_anonymous ? <Text className="text-primary dark:text-secondary font-medium text-xs py-1 px-2">(Anonymous)</Text> : null}</Text>
            </View>
            {data.current_user_votes.length > 0 ? (
                <PollResults data={data} />
            ) : (
                <>
                    {data.poll.is_multi_choice ? (
                        <MultiChoicePoll data={data} messageID={messageID} />
                    ) : (
                        <SingleChoicePoll data={data} messageID={messageID} />
                    )}
                </>
            )}

            {data.poll.is_disabled ? (
                <Text className="text-muted-foreground text-xs">Poll is now closed</Text>
            ) : null}

            {data.current_user_votes.length ? <View>
                {data.poll.is_anonymous ? null : <ViewPollVotes poll={data} />}
            </View> : null}
        </View>
    )
}

const PollOption = ({ data, option }: { data: Poll; option: RavenPollOption }) => {

    const width = useSharedValue(0)

    const isCurrentUserVote = useMemo(() => {
        return data.current_user_votes.some((vote) => vote.option === option.name)
    }, [data.current_user_votes, option.name])

    const percentage = useMemo(() => {
        const getPercentage = (votes: number) => {
            if (data.poll.is_multi_choice) {
                const totalVotes = data.poll.options.reduce((acc, opt) => acc + (opt.votes ?? 0), 0)
                return totalVotes ? (votes / totalVotes) * 100 : 0
            }
            return data.poll.total_votes ? (votes / data.poll.total_votes) * 100 : 0
        }
        return getPercentage(option.votes ?? 0)
    }, [option.votes, data])

    useEffect(() => {
        width.value = withTiming(percentage, { duration: 500 })
    }, [percentage])

    const { colors, colorScheme } = useColorScheme()

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${width.value}%`,
            backgroundColor: isCurrentUserVote ? colorScheme === "dark" ? colors.primary : colors?.secondary : colorScheme === "dark" ? colors?.grey4 : colors?.grey5,
        }
    })

    return (
        <View className="relative flex-row justify-between items-center w-full mb-2">
            <Animated.View
                className={`absolute top-0 left-0 h-full rounded-l ${Math.round(percentage) === 100 ? 'rounded-r' : ''}`}
                style={animatedStyle}
            />
            <Text className={`px-2.5 py-1.5 w-[70%] text-sm ${isCurrentUserVote ? 'font-semibold' : ''}`}>
                {option.option}
            </Text>
            <Text className={`px-2.5 py-1.5 text-sm w-[30%] text-right ${isCurrentUserVote ? 'font-semibold' : ''}`}>
                {percentage.toFixed(1)}%
            </Text>
        </View>
    )
}

const PollResults = ({ data }: { data: Poll }) => {
    return (
        <View className="w-full">
            {data.poll.options.map((option) => (
                <PollOption key={option.name} data={data} option={option} />
            ))}
            <Text className="pl-2 text-sm font-medium text-muted-foreground">
                {`${data.poll.total_votes || 0} vote${data.poll.total_votes === 1 ? '' : 's'}`}
            </Text>
        </View>
    )
}

const SingleChoicePoll = ({ data, messageID }: { data: Poll; messageID: string }) => {

    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote')
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    const onVoteSubmit = async (option: RavenPollOption) => {
        return call({
            'message_id': messageID,
            'option_id': option.name
        }).then(() => {
            toast.success('Your vote has been submitted!')
        }).catch((error) => {
            toast.error("Could not submit your vote")
        })
    }

    const handleOptionSelect = (option: RavenPollOption) => {
        if (!data.poll.is_disabled) {
            setSelectedOption(option.name)
            onVoteSubmit(option) // Automatically submit the vote when an option is selected
        }
    }

    return (
        <View className="gap-1">
            {data.poll.options.map((option) => (
                <Pressable
                    key={option.name}
                    onPress={() => handleOptionSelect(option)}
                    className='flex flex-row gap-2 items-center py-2'>
                    <Checkbox
                        checked={selectedOption === option.name}
                        disabled={!!data.poll.is_disabled}
                        onCheckedChange={() => handleOptionSelect(option)}
                    />
                    <Text className="text-[15px] text-foreground">
                        {option.option}
                    </Text>
                </Pressable>
            ))}
        </View>
    )
}

const MultiChoicePoll = ({ data, messageID }: { data: Poll; messageID: string }) => {

    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote')

    const handleCheckboxChange = (name: string, value: boolean | string) => {
        if (value) {
            setSelectedOptions((opts) => [...opts, name])
        } else {
            setSelectedOptions((opts) => opts.filter(opt => opt !== name))
        }
    }

    const onVoteSubmit = async () => {
        return call({
            'message_id': messageID,
            'option_id': selectedOptions
        }).then(() => {
            toast.success('Your vote has been submitted!')
        }).catch((error) => {
            toast.error("Could not submit your vote")
        })
    }

    return (
        <View className="gap-3">
            <View>
                {data.poll.options.map((option) => (
                    <Pressable
                        key={option.name}
                        onPress={() => {
                            if (!data.poll.is_disabled) {
                                const isSelected = selectedOptions.includes(option.name);
                                handleCheckboxChange(option.name, !isSelected);
                            }
                        }}
                        className='flex flex-row gap-2 items-center py-2'>
                        <Checkbox
                            isMultiChoice={true}
                            checked={selectedOptions.includes(option.name)}
                            disabled={!!data.poll.is_disabled}
                            onCheckedChange={(checked) => !data.poll.is_disabled && handleCheckboxChange(option.name, checked)}
                        />
                        <Text className="text-[15px] text-foreground">
                            {option.option}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View className="flex flex-col gap-3">
                <Text className="text-sm text-muted-foreground">
                    To view the poll results, please submit your choice(s)
                </Text>
                <Button
                    variant='secondary'
                    className='rounded-lg'
                    size='sm'
                    onPress={onVoteSubmit}
                    disabled={!!data.poll.is_disabled || selectedOptions.length === 0}>
                    <Text className='text-sm font-semibold'>
                        Submit
                    </Text>
                </Button>
            </View>
        </View>
    )
}