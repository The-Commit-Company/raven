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

export default function AddNewChannelMembers() {
    const { colors } = useColorScheme();
    
    const { id: channelId } = useLocalSearchParams();
    const { channel } = useCurrentChannelData(channelId as string ?? "");

    const { data: workspaceMembers } = useFetchWorkspaceMembers(channel?.channelData.workspace ?? "");

    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

    const handleDeleteMember = useCallback((member: Member) => {
        setSelectedMembers((prevMembers: Member[]) => prevMembers.filter(m => m.name !== member.name));
    }, [setSelectedMembers]);

    const insets = useSafeAreaInsets();

    const [inputText, setInputText] = useState("");
    const debouncedText = useDebounce(inputText, 200);
    
    const { channelMembers } = useFetchChannelMembers(channelId as string ?? "");
    const { enabledUsers } = useUserListProvider();

    const nonChannelMembers = useMemo(() => {
        const eligibleUsers: { [key: string]: string } = {};
        workspaceMembers?.message.forEach((m) => {
            eligibleUsers[m.user] = m.name;
        });
        return Array.from(enabledUsers.values()).filter(user => !channelMembers?.[user.name] && eligibleUsers?.[user.name]);
    }, []);

    const filteredMembers = useMemo(() => {
        const lowerCaseInput = debouncedText?.toLowerCase() || '';
        return nonChannelMembers.filter((user: UserFields) => {
            if (!debouncedText) return true;
            return (
                user?.full_name.toLowerCase().includes(lowerCaseInput) ||
                user?.name.toLowerCase().includes(lowerCaseInput)
            );
        });
    }, [debouncedText, nonChannelMembers, selectedMembers]);

    const handleSelectMember = useCallback((member: Member) => {
        setSelectedMembers((prevMembers) =>
            prevMembers.find((m) => m.name === member.name)
                ? prevMembers.filter((m) => m.name !== member.name)
                : [...prevMembers, member]
        );
    }, [selectedMembers]);

    const { mutate } = useSWRConfig();
    const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc();

    const submit = () => {
        if (selectedMembers && selectedMembers.length > 0) {
            const promises = selectedMembers.map(async (member: Member) => {
                return createDoc("Raven Channel Member", {
                    channel_id: channelId,
                    user_id: member.name,
                });
            });

            Promise.all(promises)
                .then(() => {
                    mutate(["channel_members", channelId]);
                    router.back();
                    toast.success(`Member${selectedMembers.length > 0 ? 's' : ''} added`)
                })
                .catch((error) => {
                    toast.error(`Error while adding member${selectedMembers.length > 0 ? 's' : ''}`)
                })
                .finally(() => {
                    setSelectedMembers([]);
                    setInputText("");
                });
        }
    };

    return (
        <View className='flex-1 p-3'>
            <Stack.Screen options={{
                title: 'Add Channel Members',
                headerLeft() {
                    return (
                        <Link asChild href="../" relativeToDirectory>
                            <Button variant="plain" className="ios:px-0" hitSlop={10}>
                                <CrossIcon fill={colors.icon} height={24} width={24} />
                            </Button>
                        </Link>
                    );
                },
                headerRight() {
                    return (
                        <Button variant="plain" className="ios:px-0"
                            onPress={() => selectedMembers.length && submit()}
                            disabled={creatingDoc || !selectedMembers.length}>
                            {creatingDoc ?
                                <ActivityIndicator size="small" color={colors.primary} /> :
                                <Text className="text-primary">Add</Text>}
                        </Button>
                    );
                },
                headerSearchBarOptions: {
                    onChangeText: (e) => setInputText(e.nativeEvent.text),
                    cancelButtonText: "Cancel",
                    autoFocus: true,
                    inputType: "text",
                    tintColor: colors.primary,
                    placeholder: "Search members...",
                },
                headerStyle: { backgroundColor: colors.background }
            }} />

            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <SelectedMembers selectedMembers={selectedMembers} handleDeleteMember={handleDeleteMember} />
                <MemberList filteredMembers={filteredMembers} selectedMembers={selectedMembers} handleSelectMember={handleSelectMember} debouncedText={debouncedText} />
            </KeyboardAwareScrollView>

            {!filteredMembers.length && debouncedText.length ? (
                <View className="absolute inset-0 items-center justify-center min-h-screen">
                    <Text className="text-gray-500 text-center font-sm">
                        No results found for searched text '{debouncedText}'
                    </Text>
                </View>
            ) : null}
        </View>
    );
}