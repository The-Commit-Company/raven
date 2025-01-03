import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { TouchableOpacity, View } from 'react-native'
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import { COLORS } from '@theme/colors';
import UserAvatar from '@components/layout/UserAvatar'
import useFetchWorkspaces, { WorkspaceFields } from '@raven/lib/hooks/useFetchWorkspaces';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Divider } from '@components/layout/Divider';
import CheckFilledIcon from '@assets/icons/CheckFilledIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { SiteContext } from 'app/[site_id]/_layout';
import { addWorkspaceToStorage, getWorkspaceFromStorage } from '@lib/workspace';

const WorkspaceSwitcher = () => {

    const bottomSheetRef = useSheetRef()

    // Get the site ID from context
    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename

    // Fetch workspaces
    const { data: workspaces } = useFetchWorkspaces()

    // State to store the selected workspace
    const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null)

    // Initialize Workspace
    useEffect(() => {
        const initializeWorkspace = async () => {
            // Ensure siteID and workspaces are valid
            if (!siteID || !workspaces || workspaces.message.length === 0) return

            try {
                // Check AsyncStorage for a saved workspace
                const savedWorkspace = await getWorkspaceFromStorage(siteID)

                if (savedWorkspace) {
                    // If a workspace exists, set it as selected
                    const existingWorkspace = workspaces.message.find(
                        (workspace: any) => workspace.name === savedWorkspace
                    )
                    setSelectedWorkspace(existingWorkspace || workspaces.message[0]) // Fallback to the first workspace
                } else {
                    // No workspace found, save and select the first workspace
                    const firstWorkspace = workspaces.message[0]
                    await addWorkspaceToStorage(siteID, firstWorkspace.name)
                    setSelectedWorkspace(firstWorkspace)
                }
            } catch (error) {
                console.error("Error initializing workspace:", error)
            }
        }

        initializeWorkspace()
    }, [siteID, workspaces])

    return (
        <View className='flex-1 gap-3'>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.present()}>
                <View className='flex-row items-center gap-2'>
                    <UserAvatar alt={selectedWorkspace?.workspace_name ?? 'Workspace Logo'}
                        src={selectedWorkspace?.logo ?? ''}
                        avatarProps={{ className: 'h-8 w-8' }} />
                    <View className='flex-row items-center gap-1'>
                        <Text className="text-white font-bold">{selectedWorkspace?.workspace_name}</Text>
                        <ChevronDownIcon fill={COLORS.white} height={20} width={20} />
                    </View>
                </View>
            </TouchableOpacity>
            <Sheet snapPoints={[500]} ref={bottomSheetRef}>
                <BottomSheetView className='pb-16'>
                    <SelectWorkspaceSheet selectedWorkspace={selectedWorkspace} workspaces={workspaces?.message || []} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

type Workspace = WorkspaceFields & { isSelected?: boolean }
interface SelectWorkspaceSheetProps {
    selectedWorkspace: Workspace | undefined,
    workspaces: Workspace[]
}

const SelectWorkspaceSheet = ({ selectedWorkspace, workspaces }: SelectWorkspaceSheetProps) => {

    const { myWorkspaces, otherWorkspaces } = useMemo(() => {
        const myWorkspaces: Workspace[] = []
        const otherWorkspaces: Workspace[] = []

        if (workspaces) {
            workspaces.forEach((workspace) => {
                if (workspace.workspace_member_name) {
                    myWorkspaces.push(workspace)
                    if (workspace.name === selectedWorkspace?.name) {
                        workspace.isSelected = true
                    }
                } else {
                    otherWorkspaces.push(workspace)
                }
            })
        }

        return { myWorkspaces, otherWorkspaces }
    }, [workspaces])

    return (
        <View className='flex flex-col gap-5 px-4'>
            <View className='flex flex-col gap-2 border border-border p-2 rounded-xl'>
                {myWorkspaces.map((workspace, index) => (
                    <WorkSpaceRow key={workspace.name}
                        workspace={workspace}
                        isLast={index === myWorkspaces.length - 1}
                    />
                ))}
            </View>
            {otherWorkspaces.length > 0 &&
                <View className='flex flex-col gap-2'>
                    <Text className='text-xs font-medium text-grayText'>Other workspaces</Text>
                    <View className='flex flex-col gap-2 border border-border p-2 rounded-xl'>
                        {otherWorkspaces.map((workspace, index) => (
                            <WorkSpaceRow key={workspace.name}
                                workspace={workspace}
                                isLast={index === otherWorkspaces.length - 1}
                            />
                        ))}
                    </View>
                </View>
            }
        </View>
    )
}

const WorkSpaceRow = ({ workspace, isLast }: { workspace: Workspace, isLast: boolean }) => {
    const { colors } = useColorScheme()
    return (
        <View className='flex flex-col gap-2'>
            <View className='flex-row items-center gap-2'>
                <UserAvatar
                    alt={workspace.workspace_name}
                    src={workspace.logo}
                    avatarProps={{ className: 'h-10 w-10' }}
                />
                <View className='flex-1'>
                    <Text className='text-sm font-semibold'>{workspace.workspace_name}</Text>
                    <Text className='text-sm text-gray-500'>{workspace.type}</Text>
                </View>
                {workspace.isSelected &&
                    <View className='mr-2'>
                        <CheckFilledIcon fill={colors.primary} height={20} width={20} />
                    </View>
                }
            </View>
            {!isLast && <Divider marginHorizontal={0} />}
        </View>
    )
}

export default WorkspaceSwitcher