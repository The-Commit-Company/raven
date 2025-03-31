import { Link, router, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import SearchInput from '@components/common/SearchInput/SearchInput';
import useGetDirectMessageChannels from '@raven/lib/hooks/useGetDirectMessageChannels';
import { useContext, useState } from 'react';
import { UserListContext } from '@raven/lib/providers/UserListProvider';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import { useFrappePostCall } from 'frappe-react-sdk';
import { toast } from 'sonner-native';
import UserAvatar from '@components/layout/UserAvatar';
import { Text } from '@components/nativewindui/Text';
import ErrorBanner from '@components/common/ErrorBanner';

export default function CreateDM() {

    const { colors } = useColorScheme()
    const { dmChannels } = useGetDirectMessageChannels()
    const { users } = useContext(UserListContext)
    const usersWithoutChannels = Array.from(users.values()).filter((user) => !dmChannels.find((channel) => channel.peer_user_id === user.name))

    const [searchQuery, setSearchQuery] = useState('')

    const filteredUsers = usersWithoutChannels.filter((user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return <>
        <Stack.Screen options={{
            title: 'Create DM',
            headerLeft: Platform.OS === 'ios' ? () => {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            } : undefined,
        }} />
        <View className="flex flex-col">
            <View className='p-3'>
                <SearchInput
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            <ScrollView className='h-[64vh]' contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                <View className='flex flex-col gap-2 px-2'>
                    {filteredUsers.map((user) => (
                        <UserWithoutDMItem key={user.name} userID={user.name} />
                    ))}
                </View>
                {filteredUsers.length === 0 && searchQuery.length === 0 && <Text className='text-center text-sm text-muted-foreground'>There are no users that you do not already have a DM channel with</Text>}
                {filteredUsers.length === 0 && searchQuery.length > 0 && <Text className='text-center text-sm text-muted-foreground'>No users found with '{searchQuery}' in their name</Text>}
            </ScrollView>
        </View>
    </>
}

const UserWithoutDMItem = ({ userID }: { userID: string }) => {

    const user = useGetUser(userID)
    const { call, error } = useFrappePostCall<{ message: string }>('raven.api.raven_channel.create_direct_message_channel')

    const onSelect = () => {
        call({
            user_id: userID
        }).then((res) => {
            router.back()
            router.push(`../../chat/${res?.message}`)
        }).catch(err => {
            toast.error('Could not create a DM channel')
        })
    }

    return (
        <View>
            {error ? <ErrorBanner error={error} /> : null}
            <Pressable
                key={userID}
                onPress={onSelect}
                className='flex flex-row gap-2 items-center px-1.5 py-1.5 rounded-lg ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <UserAvatar
                    src={user?.user_image}
                    alt={user?.full_name ?? user?.name ?? ''}
                    avatarProps={{ className: 'h-8 w-8' }}
                    textProps={{ className: 'text-sm' }}
                    isBot={user?.type === 'Bot'}
                />
                <Text className='text-base'>{user?.full_name}</Text>
                {!user?.enabled ?
                    <View className='px-1 mt-0.5 py-0.5 rounded-sm bg-red-100'>
                        <Text className="text-[11px] text-red-700">Disabled</Text>
                    </View>
                    : null}
            </Pressable>
        </View>
    )
}