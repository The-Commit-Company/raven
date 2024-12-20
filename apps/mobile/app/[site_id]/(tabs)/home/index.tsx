import { View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import ChannelList from '@components/features/chat/ChannelList/ChannelList';
import { useRouter } from 'expo-router';

export default function Home() {

    const router = useRouter()
    const handleChannelSelect = (channelId: string) => {
        router.push('../chat/' + channelId)
    }

    return (
        <View className="flex flex-col gap-4">
            <ThemeToggle />
            <ChannelList
                channels={[
                    {
                        name: "channel_001",
                        channel_name: "general",
                        type: "Public",
                        channel_description: "A channel for general discussions.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-01-01T12:00:00Z",
                        owner: "user_001",
                        last_message_details: {
                            sender: "user_002",
                            content: "Hello everyone!",
                        },
                        last_message_timestamp: "2024-12-01T10:00:00Z",
                    },
                    {
                        name: "channel_002",
                        channel_name: "announcements",
                        type: "Open",
                        channel_description: "Official announcements and updates.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-01-10T15:00:00Z",
                        owner: "user_003",
                        last_message_details: {
                            sender: "admin",
                            content: "Welcome to the new announcements channel!",
                        },
                        last_message_timestamp: "2024-12-05T14:30:00Z",
                    },
                    {
                        name: "channel_003",
                        channel_name: "team-alpha",
                        type: "Private",
                        channel_description: "A private channel for Team Alpha members.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-02-15T10:00:00Z",
                        owner: "user_004",
                        last_message_details: {
                            sender: "user_005",
                            content: "Let's finalize the project timeline.",
                        },
                        last_message_timestamp: "2024-12-10T09:15:00Z",
                    },
                    {
                        name: "channel_004",
                        channel_name: "support",
                        type: "Public",
                        channel_description: "A place to get support and ask questions.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-03-20T08:30:00Z",
                        owner: "user_006",
                        last_message_details: {
                            sender: "user_007",
                            content: "Can someone help with deployment?",
                        },
                        last_message_timestamp: "2024-12-12T16:45:00Z",
                    },
                    {
                        name: "channel_005",
                        channel_name: "fun-zone",
                        type: "Open",
                        channel_description: "A channel for fun and casual chats.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-04-01T12:00:00Z",
                        owner: "user_008",
                        last_message_details: {
                            sender: "user_009",
                            content: "Check out this meme!",
                        },
                        last_message_timestamp: "2024-12-15T11:00:00Z",
                    },
                    {
                        name: "channel_006",
                        channel_name: "dev-discussions",
                        type: "Private",
                        channel_description: "Discussions about development and code.",
                        is_direct_message: 0,
                        is_self_message: 0,
                        is_archived: 0,
                        creation: "2024-05-25T09:00:00Z",
                        owner: "user_010",
                        last_message_details: {
                            sender: "user_011",
                            content: "Have you seen the latest React update?",
                        },
                        last_message_timestamp: "2024-12-18T14:00:00Z",
                    },
                ]}
                onChannelSelect={handleChannelSelect}
                onLongPress={() => console.log('channel long pressed')} />
        </View>
    )
}