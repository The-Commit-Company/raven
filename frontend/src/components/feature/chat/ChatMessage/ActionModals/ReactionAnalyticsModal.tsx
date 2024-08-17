import { useMemo } from "react"
import { IconButton, Dialog, Flex, Text, Tabs, Box } from "@radix-ui/themes"
import { BiX } from "react-icons/bi"
import { ReactionObject } from "../MessageReactions"
import { ReactionAnalyticsDialogProps } from "../MessageActions/MessageReactionAnalytics"
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { UserAvatar } from "@/components/common/UserAvatar"
import { getUserImage } from "@/utils/operations"

export const ReactionAnalyticsModal: React.FC<ReactionAnalyticsDialogProps> = ({ reactions }) => {

    const { reaction_emojis, all_reacted_members } = useMemo(() => {
        const reaction_emojis = reactions.map((reaction: ReactionObject) => reaction.reaction);
        const all_reacted_members = reactions.flatMap((reaction: ReactionObject) =>
            reaction.users.map((user: string) => ({ user, reaction: reaction.reaction }))
        );
        return { reaction_emojis, all_reacted_members };
    }, [reactions]);

    return (
        <>
            {/* <DialogHeader /> */}
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

const DialogHeader = () => (
    <Flex justify="between">
        <Dialog.Title>
            <Flex align="center" gap="2">
                <MdOutlineEmojiEmotions />
                <Text>Reaction Analytics</Text>
            </Flex>
        </Dialog.Title>
        <Dialog.Close className="invisible sm:visible">
            <IconButton size="1" variant="soft" color="gray">
                <BiX size="18" />
            </IconButton>
        </Dialog.Close>
    </Flex>
);

const TabTrigger = ({ emojiStr, count }: { emojiStr: string; count?: number }) => (
    <Tabs.Trigger value={emojiStr}>
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
    const allUsers = useGetUserRecords();
    const userImage = getUserImage(user, allUsers)

    return (
        <Box className="hover:bg-slate-3 rounded-md">
            <Flex align="center" justify="between">
                <Flex className="p-2" gap="3" align="center">
                    <UserAvatar src={userImage} size="2" />
                    <Text size="2" weight="medium">
                        {user}
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