import { useMemo } from "react"
import { Flex, Text, Tabs, Box } from "@radix-ui/themes"
import { ReactionObject } from "../MessageReactions"
import { ReactionAnalyticsDialogProps } from "../MessageActions/MessageReactionAnalytics"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useGetUser } from "@/hooks/useGetUser"

export const ReactionAnalyticsModal = ({ reactions }: ReactionAnalyticsDialogProps) => {

    const all_reacted_members = useMemo(() => {
        return reactions.flatMap(({ reaction, users, is_custom, emoji_name }: ReactionObject) =>
            users.map((user: string) => ({ user, reaction, is_custom, emoji_name }))
        );
    }, [reactions]);

    return (
        <>
            <Tabs.Root defaultValue="All">
                <Flex direction="column" gap="4">
                    <Tabs.List>
                        <TabTrigger emojiSrc="All" emojiName="All" />
                        {reactions.map((reaction) => {
                            return <TabTrigger
                                key={reaction.reaction}
                                emojiSrc={reaction.reaction}
                                isCustom={reaction.is_custom}
                                emojiName={reaction.emoji_name}
                                count={reaction.count} />;
                        })}
                    </Tabs.List>
                    <Box>
                        <Tabs.Content value="All">
                            <UserList users={all_reacted_members} />
                        </Tabs.Content>
                        {reactions.map((reaction) => (
                            <Tabs.Content key={reaction.reaction} value={reaction.reaction}>
                                <UserList users={reaction.users.map((user) => ({ user, reaction: reaction.reaction, is_custom: reaction.is_custom, emoji_name: reaction.emoji_name }))} />
                            </Tabs.Content>
                        ))}
                    </Box>
                </Flex>
            </Tabs.Root>
        </>
    );
};

const TabTrigger = ({ emojiSrc, count, emojiName, isCustom = false }: { emojiSrc: string; count?: number, emojiName: string, isCustom?: boolean }) => (
    <Tabs.Trigger value={emojiSrc} className="text-gray-11" title={emojiName}>
        <Flex gap="2" align="center" justify="center">

            {isCustom ? <img src={emojiSrc} alt={emojiName} className="w-[1.2rem] h-[1.2rem] object-contain object-center" /> :
                emojiName === 'All' ? <Text size="3">All</Text> :
                    <Text size="3" className="w-[1.2rem] h-[1.2rem]">
                        {/* @ts-expect-error */}
                        <em-emoji native={emojiName} set='apple'></em-emoji></Text>
            }
            {count && <Text>{count}</Text>}
        </Flex>
    </Tabs.Trigger>
);

interface UserItemProps {
    user: string;
    reaction?: string;
    is_custom?: boolean;
    emoji_name?: string;
}
const UserList = ({ users }: { users: UserItemProps[] }) => (
    <Box className="overflow-hidden overflow-y-scroll h-[50vh] sm:h-64">
        <Flex direction="column" gap="2">
            <Flex direction="column">
                {users.map((user, index) => (
                    <UserItem key={index} user={user.user} reaction={user.reaction} is_custom={user.is_custom} emoji_name={user.emoji_name} />
                ))}
            </Flex>
        </Flex>
    </Box>
);

const UserItem = ({ user, reaction, is_custom, emoji_name }: UserItemProps) => {
    const userDetails = useGetUser(user)
    const userName = userDetails?.full_name ?? user;

    return (
        <Box className="hover:bg-slate-3 rounded-md">
            <Flex align="center" justify="between">
                <Flex className="p-2" gap="3" align="center">
                    <UserAvatar src={userDetails?.user_image ?? ''} alt={userName} size="2" />
                    <Text size="2" weight="medium">
                        {userName}
                    </Text>
                </Flex>
                {is_custom ? (
                    <img src={reaction} alt={emoji_name} title={emoji_name} className="mr-3 w-[1.4rem] h-[1.4rem] object-contain object-center" />
                ) : (
                    <Text className="pr-3 h-[1.4rem] w-[1.4rem]" size="3" weight="medium">
                        {/* @ts-expect-error */}
                        <em-emoji native={emoji_name} size='1.2em' set='apple'></em-emoji>
                    </Text>
                )}
            </Flex>
        </Box>
    );
};