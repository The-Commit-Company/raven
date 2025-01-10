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
    const { channelMembers, mutate: updateMembers } = useFetchChannelMembers(channelId as string ?? "");

    const displayMembers = Object.values(channelMembers).slice(0, 5);

    return (
        <View className="bg-card p-4 rounded-lg">
            <View>
                <Pressable onPress={onViewAll}>
                    <Text className="text-sm font-medium text-muted-foreground justify-self-end">View All Members</Text>
                </Pressable>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row gap-2 w-full"
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
                    {/* {remainingCount > 0 && (
                        <View className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ml-1">
                            <Text className="text-xs">+{remainingCount}</Text>
                        </View>
                    )} */}
                </ScrollView>
            </View>
        </View>
    );
};