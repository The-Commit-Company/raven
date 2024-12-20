import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFrappeDocumentEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { Checkbox } from '@components/nativewindui/Checkbox';
import { Button } from '@components/nativewindui/Button';
import ViewPollVotes from '@components/features/polls/ViewPollVotes';
import { Text } from '@components/nativewindui/Text';
import { UserFields } from '@raven/types/common/UserFields';
import { RavenPoll } from '@raven/types/RavenMessaging/RavenPoll';
import { RavenPollOption } from '@raven/types/RavenMessaging/RavenPollOption';
import { useColorScheme } from "@hooks/useColorScheme"
import { PollMessage } from '@raven/types/common/Message';

type PollMessageBlockProps = {
    message: PollMessage,
    user?: UserFields,
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
        <View {...props} className="p-3">
            {error ? (
                <View className="bg-red-100 p-2 rounded-md">
                    <Text className="text-re-600">{error.message}</Text>
                </View>
            ) : null}
            {data ? <PollMessageBox data={data.message} messageID={message.name} /> : null}
        </View>
    );
};

const PollMessageBox = ({ data, messageID }: { data: Poll; messageID: string }) => {
    return (
        <View className="bg-gray-200 dark:bg-gray-950 w-full rounded-md p-3 gap-0.5">
            <View className="flex-row justify-between items-center pb-2">
                <Text className="font-medium">{data.poll.question}</Text>
                {data.poll.is_anonymous ? (
                    <View className="bg-blue-100 dark:bg-blue-300 rounded">
                        <Text className="text-blue-700 dark:text-blue-800 font-medium text-xs py-1 px-2">Anonymous</Text>
                    </View>
                ) : null}
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
                <View className="bg-gray-100 px-2 py-1 rounded mt-2">
                    <Text className="text-gray-600 text-xs">Poll is now closed</Text>
                </View>
            ) : null}

            {!data.poll.is_anonymous ? <View className="h-px bg-gray-300 dark:bg-gray-700 w-full my-3" /> : null}

            {data.poll.is_anonymous ? null : <ViewPollVotes poll={data} />}
        </View>
    );
};

const PollOption = ({ data, option }: { data: Poll; option: RavenPollOption }) => {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming(200, { duration: 500 });
    }, []);

    const isCurrentUserVote = useMemo(() => {
        return data.current_user_votes.some((vote) => vote.option === option.name);
    }, [data.current_user_votes, option.name]);

    const percentage = useMemo(() => {

        const getPercentage = (votes: number) => {
            if (data.poll.is_multi_choice) {
                const totalVotes = data.poll.options.reduce((acc, opt) => acc + (opt.votes ?? 0), 0);
                return (votes / totalVotes) * 100;
            }
            return (votes / data.poll.total_votes) * 100;
        };

        return getPercentage(option.votes ?? 0);
    }, [option.votes, data]);

    const { colors, colorScheme } = useColorScheme()

    return (
        <View className="relative flex-row justify-between items-center w-full mb-2">
            <Animated.View className={`absolute top-0 left-0 h-full rounded-l`} style={{ width: width, backgroundColor: isCurrentUserVote ? colorScheme === "light" ? colors.secondary : colors.primary : undefined }} />
            <Text className={`p-2 z-10 ${isCurrentUserVote ? 'font-bold' : 'font-normal'}`}>
                {option.option}
            </Text>
            <Text className={`p-2 z-10 ${isCurrentUserVote ? 'font-bold' : 'font-normal'}`}>
                {percentage.toFixed(1)}%
            </Text>
        </View>
    );
};

const PollResults = ({ data }: { data: Poll }) => {
    return (
        <View className="w-full">
            {data.poll.options.map((option) => (
                <PollOption key={option.name} data={data} option={option} />
            ))}
            <Text className="text-sm text-gray-500 px-2">
                {data.poll.total_votes} vote{data.poll.total_votes > 1 ? 's' : ''}
            </Text>
        </View>
    );
};

const SingleChoicePoll = ({ data, messageID }: { data: Poll; messageID: string }) => {
    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote');

    const onVoteSubmit = async (option: RavenPollOption) => {
        return call({
            'message_id': messageID,
            'option_id': option.name
        }).then(() => {
            // toast.success('Your vote has been submitted!')
        }).catch((error) => {
            // toast.error(getErrorMessage(error))
        })
    }

    return (
        <View className="gap-3 mt-2">
            {data.poll.options.map((option) => (
                <View key={option.name} className='flex flex-row gap-3 items-center'>
                    <Checkbox
                        disabled={data.poll.is_disabled ? true : false}
                        onCheckedChange={() => onVoteSubmit(option)}
                    />
                    <Text className="text-base text-gray-800 dark:text-gray-200">
                        {option.option}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const MultiChoicePoll = ({ data, messageID }: { data: Poll; messageID: string }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const { call } = useFrappePostCall('raven.api.raven_poll.add_vote');

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
            // toast.success('Your vote has been submitted!')
        }).catch((error) => {
            // toast.error(getErrorMessage(error))
        })
    };

    return (
        <View className="gap-4">
            <View className="gap-3 mt-2">
                {data.poll.options.map((option) => (
                    <View key={option.name} className='flex flex-row gap-3 items-center'>
                        <Checkbox
                            checked={selectedOptions.includes(option.name)}
                            disabled={!!data.poll.is_disabled}
                            onCheckedChange={(checked) => !data.poll.is_disabled && handleCheckboxChange(option.name, checked)}
                        />
                        <Text className="text-base text-gray-800 dark:text-gray-200">
                            {option.option}
                        </Text>
                    </View>
                ))}
            </View>

            <View className="flex w-full flex-row justify-between items-center">
                <Text className="text-sm text-gray-500 mr-4 max-w-[65%]">
                    To view the poll results, please submit your choice(s)
                </Text>
                <Button className='bg-transparent' onPress={onVoteSubmit} disabled={!!data.poll.is_disabled || selectedOptions.length === 0}>
                    <Text className='text-blue-800'>Submit</Text>
                </Button>
            </View>
        </View>
    );
};