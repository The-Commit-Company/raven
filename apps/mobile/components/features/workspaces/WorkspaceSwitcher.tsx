import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { TouchableOpacity, View } from 'react-native'
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import { COLORS } from '@theme/colors';
import UserAvatar from '@components/layout/UserAvatar'
import useFetchWorkspaces, { WorkspaceFields } from '@raven/lib/hooks/useFetchWorkspaces';
import { useMemo } from 'react';
import { Divider } from '@components/layout/Divider';
import CheckIcon from '@assets/icons/CheckIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { useGlobalSearchParams } from 'expo-router';


const WorkspaceSwitcher = () => {

    const bottomSheetRef = useSheetRef()
    const { workspace_id } = useGlobalSearchParams();

    console.log("Workspace ID: ", workspace_id);
    return (
        <View className='flex-1 gap-3'>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.present()}>
                <View className='flex-row items-center gap-2'>
                    <UserAvatar alt={'Workspace Logo'} avatarProps={{ className: 'h-8 w-8' }} />
                    <View className='flex-row items-center gap-1'>
                        <Text className="text-white font-bold">Workspace</Text>
                        <ChevronDownIcon fill={COLORS.white} height={20} width={20} />
                    </View>
                </View>
            </TouchableOpacity>
            <Sheet snapPoints={[500]} ref={bottomSheetRef}>
                <BottomSheetView className='pb-16'>
                    <SelectWorkspaceSheet />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

const SelectWorkspaceSheet = () => {

    const { data } = useFetchWorkspaces()

    console.log("Data: ", data)

    const { myWorkspaces, otherWorkspaces } = useMemo(() => {
        const myWorkspaces: WorkspaceFields[] = []
        const otherWorkspaces: WorkspaceFields[] = []

        if (data) {
            data.message.forEach((workspace) => {
                if (workspace.workspace_member_name) {
                    myWorkspaces.push(workspace)
                } else {
                    otherWorkspaces.push(workspace)
                }
            })
        }

        return { myWorkspaces, otherWorkspaces }
    }, [data])

    return (
        <View className='flex flex-col gap-5 px-4'>
            <View className='flex flex-col gap-0'>
                <Text className='text-lg font-semibold'>Your workspaces</Text>
                <Text className='text-sm text-gray-500'>Quickly switch between your workspaces</Text>
            </View>
            <View className='flex flex-col gap-4'>
                {myWorkspaces.map((workspace) => (
                    <WorkSpaceRow key={workspace.name} workspace={workspace} />
                ))}
            </View>
            {otherWorkspaces.length > 0 && (
                <>
                    <Divider marginHorizontal={0} />
                    <View className='flex flex-col gap-0'>
                        <Text className='text-lg font-semibold'>Other workspaces</Text>
                        <Text className='text-sm text-gray-500'>Workspaces that you are not a member of</Text>
                    </View>
                    <View className='flex flex-col gap-4'>
                        {otherWorkspaces.map((workspace) => (
                            <WorkSpaceRow key={workspace.name} workspace={workspace} />
                        ))}
                    </View>
                </>
            )}
        </View>
    )
}

const WorkSpaceRow = ({ workspace }: { workspace: WorkspaceFields }) => {
    const { colors } = useColorScheme()
    return (
        <View className='flex-row items-center gap-2'>
            <UserAvatar alt={workspace.workspace_name}
                src={workspace.logo}
                avatarProps={{ className: 'h-10 w-10' }} />
            <View className='flex-1'>
                <Text className='text-sm font-semibold'>{workspace.workspace_name}</Text>
                <Text className='text-sm text-gray-500'>{workspace.type}</Text>
            </View>
            <View className='mr-2'>
                <CheckIcon fill={colors.icon} height={20} width={20} />
            </View>
        </View>
    )
}

export default WorkspaceSwitcher