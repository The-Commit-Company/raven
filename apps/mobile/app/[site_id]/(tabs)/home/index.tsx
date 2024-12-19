import { Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import ChannelList from '@components/features/chat/ChannelList/ChannelList';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import DMList from '@components/features/chat/DMList/DMList';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { SearchInput } from '@components/nativewindui/SearchInput';

export default function Home() {

    const { colors } = useColorScheme()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary }} className="flex flex-col px-4 pb-4 pt-2 gap-2">
                <View className='flex-row items-center justify-between'>
                    <Pressable onPress={() => console.log('Workspace pressed')}>
                        <Text className="text-white font-bold">Workspace</Text>
                    </Pressable>
                    <ThemeToggle />
                </View>
                <SearchInput />
            </View>
            <ScrollView style={{ backgroundColor: colors.background }} className="rounded-t-[2rem]">
                <View className="flex flex-col">
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
                        onChannelSelect={() => console.log('channel selected')}
                        onLongPress={() => console.log('channel long pressed')} />
                    <Divider />
                    <DMList dms={[
                        {
                            peer_user_id: 'user_001',
                            is_direct_message: 1,
                            name: 'DM-001',
                            channel_name: 'Alice Johnson',
                            type: 'Private',
                            channel_description: 'Direct conversation with Alice Johnson',
                            is_self_message: 0,
                            is_archived: 0,
                            creation: '2024-01-01T10:00:00Z',
                            owner: 'current_user_id',
                            last_message_details: {
                                sender: 'Alice Johnson',
                                content: 'Hey, how’s it going?',
                            },
                            last_message_timestamp: '2024-01-05T09:30:00Z',
                        },
                        {
                            peer_user_id: 'user_002',
                            is_direct_message: 1,
                            name: 'DM-002',
                            channel_name: 'Bob Smith',
                            type: 'Private',
                            channel_description: 'Direct conversation with Bob Smith',
                            is_self_message: 0,
                            is_archived: 0,
                            creation: '2024-01-02T11:15:00Z',
                            owner: 'current_user_id',
                            last_message_details: {
                                sender: 'Bob Smith',
                                content: 'Check out this new design mockup.',
                            },
                            last_message_timestamp: '2024-01-06T14:20:00Z',
                        },
                        {
                            peer_user_id: 'user_003',
                            is_direct_message: 1,
                            name: 'DM-003',
                            channel_name: 'Charlie Davis',
                            type: 'Private',
                            channel_description: 'Direct conversation with Charlie Davis',
                            is_self_message: 0,
                            is_archived: 0,
                            creation: '2024-01-03T08:45:00Z',
                            owner: 'current_user_id',
                            last_message_details: {
                                sender: 'Charlie Davis',
                                content: 'Let’s meet tomorrow at 10 AM.',
                            },
                            last_message_timestamp: '2024-01-07T07:50:00Z',
                        },
                        {
                            peer_user_id: 'user_004',
                            is_direct_message: 1,
                            name: 'DM-004',
                            channel_name: 'Diana White',
                            type: 'Private',
                            channel_description: 'Direct conversation with Diana White',
                            is_self_message: 0,
                            is_archived: 0,
                            creation: '2024-01-04T12:20:00Z',
                            owner: 'current_user_id',
                        },
                    ]}
                        onDMSelect={() => console.log('dm selected')} />
                    <Divider />
                    <Pressable className='flex-row items-center p-5 rounded-lg'
                        onPress={() => console.log('Create channel pressed')}>
                        <PlusIcon fill={colors.icon} height={18} width={18} />
                        <Text className='ml-3 text-[16px]'>Add teammates</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

const Divider = () => {
    const { colors } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.grey5,
                marginHorizontal: 16
            }}
        />
    )
}