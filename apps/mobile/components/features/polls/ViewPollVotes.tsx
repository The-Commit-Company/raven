import { View, TouchableOpacity } from 'react-native';
import { useFrappeGetCall } from 'frappe-react-sdk'
import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { Text } from '@components/nativewindui/Text';
import { Poll } from '../chat/ChatMessage/Renderers/PollMessage';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import UserAvatar from '@components/layout/UserAvatar';
import { Divider } from '@components/layout/Divider';
import ErrorBanner from '@components/common/ErrorBanner';

type VoteData = {
    users: string[],
    count: number,
    percentage: number
}

type PollVotesResponse = Record<string, VoteData>

interface ViewPollVotesProps {
    poll: Poll
}

const ViewPollVotes = ({ poll }: ViewPollVotesProps) => {

    const bottomSheetRef = useSheetRef()

    return (
        <View>
            <TouchableOpacity
                className="w-full pt-2"
                onPress={() => bottomSheetRef.current?.present()}
                activeOpacity={0.6}>
                <Text className="text-center text-sm text-primary dark:text-secondary font-medium">
                    View votes
                </Text>
            </TouchableOpacity>

            <Sheet ref={bottomSheetRef} enableDynamicSizing maxDynamicContentSize={720}>
                <BottomSheetScrollView>
                    <View className="flex-col px-4 mt-2 mb-16">
                        {poll && <ViewPollVotesModalContent poll={poll} />}
                    </View>
                </BottomSheetScrollView>
            </Sheet>
        </View>
    );
};

export default ViewPollVotes

interface ViewPollVotesModalContentProps {
    poll: Poll
}
const ViewPollVotesModalContent = ({ poll }: ViewPollVotesModalContentProps) => {

    const { data, error } = useFrappeGetCall<{ message: PollVotesResponse }>('raven.api.raven_poll.get_all_votes', {
        'poll_id': poll?.poll?.name,
    }, `poll_votes_${poll?.poll?.name}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return (
        <View>
            {error && <ErrorBanner error={error} />}
            {data && data.message && <VotesBlock votesData={data.message} poll={poll} />}
        </View>
    )
}

const VotesBlock = ({ votesData, poll }: { votesData: PollVotesResponse; poll: Poll }) => {
    return (
        <View>
            <View className="flex-row justify-between items-baseline mb-4">
                <Text className="text-xl font-cal-sans">Poll Votes</Text>
                <Text className="text-sm text-muted-foreground">
                    {poll.poll.total_votes} vote{poll.poll.total_votes > 1 ? 's' : ''}
                </Text>
            </View>

            <Text className="text-base font-semibold mb-2 text-foreground line-clamp-2 text-ellipsis overflow-hidden">
                {poll.poll.question}
            </Text>

            {Object.keys(votesData).map((opt) => {
                const option = votesData[opt];
                const optionName = poll.poll.options.find(o => o.name === opt)?.option;
                return (
                    <View key={opt} className="mb-3">
                        <View className="flex-row justify-between items-center py-2">
                            <View className="flex-row items-center">
                                <Text className="text-sm text-foreground">{optionName}</Text>
                                <Text className="text-sm text-muted-foreground ml-1">
                                    - {option.percentage.toFixed(2)}%
                                </Text>
                            </View>
                            <Text className="text-sm text-muted-foreground">
                                {option.count} vote{option.count > 1 ? 's' : ''}
                            </Text>
                        </View>
                        <View className="bg-card rounded-lg p-2.5">
                            {option.users.map((user, index) => (
                                <View key={user}>
                                    <UserVote user_id={user} />
                                    {option.users.length - 1 !== index && <Divider className='mx-0 my-2' prominent />}
                                </View>
                            ))}
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

const UserVote = ({ user_id }: { user_id: string }) => {
    const user = useGetUser(user_id)
    return (
        <View className="flex flex-row items-center gap-3">
            <UserAvatar src={user?.user_image} alt={user?.full_name ?? user?.name ?? ''} avatarProps={{ className: 'h-8 w-8' }} textProps={{ className: 'text-sm' }} />
            <Text className="font-medium text-sm text-foreground">{user?.full_name}</Text>
        </View>
    )
}