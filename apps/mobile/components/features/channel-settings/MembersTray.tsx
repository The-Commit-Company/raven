import UserAvatar from "@components/layout/UserAvatar";
import { Pressable, View } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { useLocalSearchParams } from "expo-router";
import { useFetchChannelMembers } from "@raven/lib/hooks/useFetchChannelMembers";
import { ScrollView } from "react-native-gesture-handler";

interface MembersTrayProps {
    onViewAll: () => void;
}

export const MembersTray = ({ onViewAll }: MembersTrayProps) => {

    const { id: channelId } = useLocalSearchParams()
    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "");

    const displayMembers = Object.values(channelMembers).slice(0, 5);

    return (
        <View className="bg-card p-4 rounded-lg">
            <View className="flex-col gap-2">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="flex-row gap-4"
                >
                    {displayMembers.map((member, index) => (
                        <View className="flex-col items-center gap-2" key={index}>
                            <UserAvatar
                                src={member.user_image ?? ""}
                                alt={member.full_name ?? ""}
                                availabilityStatus={member.availability_status}
                                avatarProps={{ className: "w-12 h-12" }}
                            />
                            <Text
                                className="text-xs truncate w-16"
                                numberOfLines={1}
                            >
                                {member.full_name}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
                <Pressable onPress={onViewAll}>
                    <View className="flex-row items-center justify-end">
                        <Text className="text-sm font-medium text-muted-foreground">See All</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};