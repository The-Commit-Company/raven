import UserAvatar from "@components/layout/UserAvatar";
import { Text } from "@components/nativewindui/Text";
import { useFetchChannelMembers } from "@raven/lib/hooks/useFetchChannelMembers";
import { FC, useMemo } from "react";
import { View } from "react-native";
import { Pressable } from "react-native";
import { MentionSuggestionsProps } from "react-native-controlled-mentions";

type Props = MentionSuggestionsProps & {
    channelID: string
}

export const UserMentions: FC<Props> = ({ keyword, onSuggestionPress, channelID }) => {

    const { channelMembers } = useFetchChannelMembers(channelID)

    const suggestions = useMemo(() => {

        if (!channelMembers) return []

        const memberArray = Object.values(channelMembers).map((member) => ({
            id: member.name,
            name: member.full_name,
            image: member.user_image ?? undefined,
            isBot: member.type === 'Bot'
        }))

        if (!keyword) {
            return memberArray.slice(0, 5)
        }

        const k = keyword.toLowerCase()

        return memberArray.filter((member) => member.name.toLowerCase().includes(k)).slice(0, 5)
    }, [channelMembers, keyword])

    if (keyword == null) {
        return null;
    }

    return (
        <View className="flex flex-col border-b border-border rounded-md">
            {suggestions.map(one => (
                <Pressable
                    key={one.id}
                    hitSlop={10}
                    className="active:bg-card-background/50 py-1.5 px-2"
                    onPress={() => onSuggestionPress(one)}
                >
                    <View className="flex flex-row items-center gap-2">
                        <UserAvatar
                            alt={one.name}
                            avatarProps={{ className: 'w-6 h-6' }}
                            fallbackProps={{ className: 'w-6 h-6' }}
                            textProps={{ className: 'text-xs' }}
                            src={one.image} />
                        <Text className="text-sm text-foreground">{one.name}</Text>
                    </View>
                </Pressable>
            ))
            }
        </View>
    );
};