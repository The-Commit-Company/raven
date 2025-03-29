import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { useCallback, useMemo, useState } from 'react';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import { useUserListProvider } from '@raven/lib/providers/UserListProvider';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { UserFields } from '@raven/types/common/UserFields';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFrappeCreateDoc, useSWRConfig } from 'frappe-react-sdk';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { useFetchWorkspaceMembers } from '@raven/lib/hooks/useFetchWorkspaceMembers';
import { Text } from '@components/nativewindui/Text';
import { Button } from '@components/nativewindui/Button';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import SelectedMembers from '@components/features/channel-settings/Members/SelectedMembers';
import MemberList from '@components/features/channel-settings/Members/MemberList';
import { toast } from 'sonner-native';
import SearchInput from '@components/common/SearchInput/SearchInput';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function AddNewChannelMembers() {

    const { colors } = useColorScheme()

    const { id: channelId } = useLocalSearchParams()
    const { channel } = useCurrentChannelData(channelId as string ?? "")

    const { data: workspaceMembers } = useFetchWorkspaceMembers(channel?.channelData.workspace ?? "")

    const [selectedMembers, setSelectedMembers] = useState<Member[]>([])

    const handleRemoveMember = useCallback((member: Member) => {
        setSelectedMembers((prevMembers: Member[]) => prevMembers.filter(m => m.name !== member.name))
    }, [setSelectedMembers])

    const insets = useSafeAreaInsets()

    const [searchQuery, setSearchQuery] = useState("")
    const debouncedText = useDebounce(searchQuery, 200)

    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "")
    const { enabledUsers } = useUserListProvider()

    const nonChannelMembers = useMemo(() => {
        if (!workspaceMembers || !enabledUsers) return []
        const eligibleUsers: { [key: string]: string } = {}
        workspaceMembers?.message.forEach((m) => {
            eligibleUsers[m.user] = m.name
        })
        return Array.from(enabledUsers.values()).filter(user => !channelMembers?.[user.name] && eligibleUsers?.[user.name])
    }, [workspaceMembers, enabledUsers, channelMembers])

    const filteredMembers = useMemo(() => {
        if (!nonChannelMembers) return []
        const lowerCaseInput = debouncedText?.toLowerCase() || ''
        return nonChannelMembers.filter((user: UserFields) => {
            if (!debouncedText) return true
            return (
                user?.full_name.toLowerCase().includes(lowerCaseInput) ||
                user?.name.toLowerCase().includes(lowerCaseInput)
            )
        })
    }, [debouncedText, nonChannelMembers, selectedMembers])

    const handleSelectMember = useCallback((member: Member) => {
        setSelectedMembers((prevMembers) =>
            prevMembers.find((m) => m.name === member.name)
                ? prevMembers.filter((m) => m.name !== member.name)
                : [...prevMembers, member]
        )
    }, [selectedMembers])

    const { mutate } = useSWRConfig()
    const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc()

    const submit = () => {
        if (selectedMembers && selectedMembers.length > 0) {
            const promises = selectedMembers.map(async (member: Member) => {
                return createDoc("Raven Channel Member", {
                    channel_id: channelId,
                    user_id: member.name,
                })
            })
            Promise.all(promises)
                .then(() => {
                    mutate(["channel_members", channelId])
                    router.back()
                    toast.success(`Member${selectedMembers.length > 0 ? 's' : ''} added`)
                })
                .catch((error) => {
                    toast.error(`Error while adding member${selectedMembers.length > 0 ? 's' : ''}`)
                })
                .finally(() => {
                    setSelectedMembers([])
                    setSearchQuery("")
                })
        }
    }

    return (
        <View className='flex-1 bg-background'>
            <Stack.Screen options={{
                headerLeft() {
                    return (
                        <Link asChild href="../" relativeToDirectory>
                            <Button variant="plain" className="ios:px-0" hitSlop={10}>
                                <CrossIcon color={colors.icon} height={24} width={24} />
                            </Button>
                        </Link>
                    )
                },
                headerTitle: () => <Text className='ml-2 text-base font-semibold'>Add Members</Text>,
                headerRight() {
                    return (
                        <Button variant="plain" className="ios:px-0"
                            onPress={() => selectedMembers.length && submit()}
                            disabled={creatingDoc || !selectedMembers.length}>
                            {creatingDoc ?
                                <ActivityIndicator size="small" color={colors.primary} /> :
                                <Text className="text-primary dark:text-secondary">Add</Text>}
                        </Button>
                    )
                },
                headerStyle: { backgroundColor: colors.background },
            }} />
            <View className='px-4 pt-3'>
                <SearchInput
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                bounces={false}
                showsVerticalScrollIndicator={false}>
                <SelectedMembers selectedMembers={selectedMembers} handleRemoveMember={handleRemoveMember} />
                <MemberList filteredMembers={filteredMembers} selectedMembers={selectedMembers} handleSelectMember={handleSelectMember} debouncedText={debouncedText} />
            </KeyboardAwareScrollView>

            {!filteredMembers.length && debouncedText.length ? (
                <View className="absolute inset-0 items-center justify-center h-80">
                    <Text className="text-[15px] text-center text-muted-foreground">
                        No results found for searched text <Text className='text-[15px] text-center text-muted-foreground font-medium'>'{debouncedText}'</Text>
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

export const ErrorBoundary = CommonErrorBoundary