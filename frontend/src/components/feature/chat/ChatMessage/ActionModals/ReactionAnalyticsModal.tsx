import { useMemo } from "react"
import { Flex, Text, Tabs, Box } from "@radix-ui/themes"
import { ReactionObject } from "../MessageReactions"
import { ReactionAnalyticsDialogProps } from "../MessageActions/MessageReactionAnalytics"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useGetUser } from "@/hooks/useGetUser"

export const ReactionAnalyticsModal = ({ reactions }: ReactionAnalyticsDialogProps) => {

    const { reaction_emojis, all_reacted_members } = useMemo(() => {
        const reaction_emojis = reactions.map((reaction: ReactionObject) => reaction.reaction);
        const all_reacted_members = reactions.flatMap(({ reaction, users }: ReactionObject) =>
            users.map((user: string) => ({ user, reaction }))
        );
        return { reaction_emojis, all_reacted_members };
    }, [reactions]);

    return (
        <>
            <Tabs.Root defaultValue="All">
                <Flex direction="column" gap="4">
                    <Tabs.List>
                        <TabTrigger emojiStr="All" />
                        {reaction_emojis.map((emojiStr) => {
                            const reaction = reactions.find((r) => r.reaction === emojiStr);
                            return <TabTrigger key={emojiStr} emojiStr={emojiStr} count={reaction?.count} />;
                        })}
                    </Tabs.List>
                    <Box>
                        <Tabs.Content value="All">
                            <UserList users={all_reacted_members} />
                        </Tabs.Content>
                        {reactions.map((reaction) => (
                            <Tabs.Content key={reaction.reaction} value={reaction.reaction}>
                                <UserList users={reaction.users.map((user) => ({ user }))} />
                            </Tabs.Content>
                        ))}
                    </Box>
                </Flex>
            </Tabs.Root>
        </>
    );
};

const TabTrigger = ({ emojiStr, count }: { emojiStr: string; count?: number }) => (
    <Tabs.Trigger value={emojiStr} className="text-gray-11">
        <Flex gap="2" align="center" justify="center">
            <Text size="3">{emojiStr}</Text>
            {count && <Text>{count}</Text>}
        </Flex>
    </Tabs.Trigger>
);

interface UserItemProps {
    user: string;
    reaction?: string;
}
const UserList = ({ users }: { users: UserItemProps[] }) => (
    <Box className="overflow-hidden overflow-y-scroll h-[50vh] sm:h-64">
        <Flex direction="column" gap="2">
            <Flex direction="column">
                {users.map((user, index) => (
                    <UserItem key={index} user={user.user} reaction={user.reaction} />
                ))}
            </Flex>
        </Flex>
    </Box>
);

const UserItem = ({ user, reaction }: UserItemProps) => {
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
                {reaction && (
                    <Text className="pr-3" size="3" weight="medium">
                        {reaction}
                    </Text>
                )}
            </Flex>
        </Box>
    );
};