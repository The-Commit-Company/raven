import React from 'react';
import { Pressable, Image, View } from 'react-native';
import { useFrappeGetCall } from 'frappe-react-sdk'
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { Text } from '@components/nativewindui/Text';
import { Poll } from '../chat/ChatMessage/Renderers/PollMessage';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import { useColorScheme } from "@hooks/useColorScheme"
import UserAvatar from '@components/layout/UserAvatar';

type VoteData = {
    users: string[];
    count: number;
    percentage: number;
}

type PollVotesResponse = Record<string, VoteData>;

interface ViewPollVotesProps {
    poll: Poll;
}

const ViewPollVotes = ({ poll }: ViewPollVotesProps) => {
    const bottomSheetRef = useSheetRef()

    const { colors } = useColorScheme()

    return (
        <View>
            <Pressable
                className="w-full"
                onPress={() => bottomSheetRef.current?.present()}
                style={({ pressed }) => [
                    { opacity: pressed ? 0.6 : 1.0 },
                ]}
            >
                <Text className="text-center text-sm cursor-pointer" style={{ color: colors.primary }}>
                    View Votes
                </Text>
            </Pressable>

            <Sheet snapPoints={[500, '80%']} ref={bottomSheetRef}>
                <BottomSheetView className='pb-16'>
                    <ViewPollVotesModalContent poll={poll} />
                </BottomSheetView>
            </Sheet>
        </View>
    );
};

export default ViewPollVotes

interface ViewPollVotesModalContentProps {
    poll: Poll;
}
const ViewPollVotesModalContent = ({ poll }: ViewPollVotesModalContentProps) => {

    const { data, error } = useFrappeGetCall<{ message: PollVotesResponse }>('raven.api.raven_poll.get_all_votes', {
        'poll_id': poll?.poll?.name,
    }, `poll_votes_${poll?.poll?.name}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return (
        <View className="p-4">
            {error && (
                <View className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">
                    <Text className="text-red-600 dark:text-red-100">
                        {error.message}
                    </Text>
                </View>
            )}
            {data && data.message && <VotesBlock votesData={data.message} poll={poll} />}
        </View>
    );
};

const VotesBlock = ({ votesData, poll }: { votesData: PollVotesResponse; poll: Poll }) => {
    return (
        <View>
            <View className="flex-row justify-between items-baseline mb-4">
                <Text className="text-xl font-bold">Poll Votes</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {poll.poll.total_votes} votes
                </Text>
            </View>

            <View className="h-px bg-gray-200 dark:bg-gray-700 w-full mb-4" />

            <Text className="text-lg font-bold mb-2 dark:text-white">
                {poll.poll.question}
            </Text>

            {Object.keys(votesData).map((opt) => {
                const option = votesData[opt];
                const optionName = poll.poll.options.find(o => o.name === opt)?.option;
                return (
                    <View key={opt} className="mb-3">
                        <View className="flex-row justify-between items-center py-2">
                            <View className="flex-row items-center">
                                <Text className="text-sm dark:text-white">{optionName}</Text>
                                <Text className="text-sm text-gray-500 ml-1">
                                    - {option.percentage.toFixed(2)}%
                                </Text>
                            </View>
                            <Text className="text-sm text-gray-500">
                                {option.count} vote{option.count > 1 ? 's' : ''}
                            </Text>
                        </View>
                        <View className="bg-gray-100 dark:bg-gray-900 rounded-md p-2.5">
                            {option.users.map((user) => (
                                <UserVote key={user} user_id={user} />
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const UserVote = ({ user_id }: { user_id: string }) => {
    const user = useGetUser(user_id);

    return (
        <View className="flex flex-row items-center gap-3">
            <UserAvatar alt={user?.full_name ?? ""} src={user?.user_image} />
            <Text className="font-medium text-sm dark:text-white">{user?.full_name}</Text>
        </View>
    );
};