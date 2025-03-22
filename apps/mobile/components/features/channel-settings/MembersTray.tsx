import UserAvatar from "@components/layout/UserAvatar";
import { View } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { useLocalSearchParams } from "expo-router";
import { useFetchChannelMembers } from "@raven/lib/hooks/useFetchChannelMembers";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "@components/nativewindui/Button";
interface MembersTrayProps {
    onViewAll: () => void
}

export const MembersTray = ({ onViewAll }: MembersTrayProps) => {

    const { id: channelId } = useLocalSearchParams()
    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "")

    const displayMembers = Object.values(channelMembers).slice(0, 10)
    const membersCount = channelMembers ? Object.keys(channelMembers).length : 0

    // Helper function to split the full name into first name and the rest
    const splitName = (fullName: string) => {
        const names = fullName.split(" ")
        const firstName = names[0]
        const restOfName = names.slice(1).join(" ")
        return { firstName, restOfName }
    }

    return (
        <View className="flex-col px-4 gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-medium">Members ({membersCount})</Text>
                <Button variant="plain" size="none" onPress={onViewAll}>
                    <View className="flex-row items-center justify-end">
                        <Text className="text-[15px] font-medium text-primary dark:text-secondary">View all</Text>
                    </View>
                </Button>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex-row gap-2"
            >
                {displayMembers.map((member, index) => {
                    const { firstName, restOfName } = splitName(member.full_name ?? "");

                    return (
                        <View className="flex-col gap-1 items-center" key={index}>
                            <UserAvatar
                                src={member.user_image ?? ""}
                                alt={member.full_name ?? ""}
                                availabilityStatus={member.availability_status}
                                avatarProps={{ className: "w-14 h-14" }}
                            />
                            <View className="flex-col gap-0.5">
                                <Text className="text-sm text-center pt-1.5">
                                    {firstName}
                                </Text>
                                <Text className="text-sm text-center" numberOfLines={1}>
                                    {restOfName}
                                </Text>
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}