import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import UserAvatar from '@components/layout/UserAvatar'

interface ViewThreadParticipantsProps {
    participants: { user_id: string }[],
}

const ViewThreadParticipants = ({ participants }: ViewThreadParticipantsProps) => {

    if (participants.length === 0)
        return null

    const totalParticipants = participants.length
    const extraNumber = Math.min(totalParticipants - 3, 9)

    return (
        <View className={'flex flex-row items-center animate-fadein'}>
            {participants.map((member, index) => {
                const user = useGetUser(member.user_id)
                if (index < 3)
                    return (
                        <View
                            key={member.user_id}
                            style={{
                                marginLeft: index === 0 ? 0 : -4,
                                zIndex: index
                            }}>
                            <UserAvatar
                                src={user?.user_image ?? undefined}
                                alt={user?.full_name ?? member.user_id}
                                avatarProps={{ className: "w-6 h-6 rounded-full" }}
                                fallbackProps={{ className: "rounded-full" }}
                                textProps={{ className: "text-xs font-semibold" }}
                                rounded
                            />
                        </View>
                    )
            })}
            {totalParticipants > 3 && (
                <View style={{ marginLeft: -4, zIndex: 4 }}>
                    <View className="bg-gray-100 dark:bg-card-background p-1.5 rounded-full">
                        <Text className="text-xs">
                            {extraNumber}+
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

export default ViewThreadParticipants