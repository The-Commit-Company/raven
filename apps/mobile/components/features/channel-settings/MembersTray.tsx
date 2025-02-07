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
    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "")

    const displayMembers = Object.values(channelMembers).slice(0, 10)
    const membersCount = channelMembers ? Object.keys(channelMembers).length : 0

    return (
        <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium">Members ({membersCount})</Text>
                <Pressable onPress={onViewAll}>
                    <View className="flex-row items-center justify-end">
                        <Text className="text-sm font-medium text-primary">View all</Text>
                    </View>
                </Pressable>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex-row gap-2"
            >
                {displayMembers.map((member, index) => (
                    <View className="flex-col gap-2" key={index}>
                        <UserAvatar
                            src={member.user_image ?? ""}
                            alt={member.full_name ?? ""}
                            availabilityStatus={member.availability_status}
                            avatarProps={{ className: "w-14 h-14" }}
                        />
                        <Text
                            className="text-xs flex-wrap w-16"
                            numberOfLines={1}
                        >
                            {member.full_name}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}