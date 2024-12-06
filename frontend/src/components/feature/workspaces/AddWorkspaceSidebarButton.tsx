import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/components/layout/Drawer'
import { HStack, Stack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { hasRavenAdminRole } from '@/utils/roles'
import { Button, Dialog, IconButton } from '@radix-ui/themes'
import { FiPlus } from 'react-icons/fi'

type Props = {}

const AddWorkspaceSidebarButton = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole()

    if (!isRavenAdmin) {
        return null
    }

    return <AddWorkspaceModal />
}

const AddWorkspaceModal = () => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {

        return <Dialog.Root>
            <Dialog.Trigger>
                <IconButton
                    color='gray'
                    size='3'
                    variant='soft'>
                    <FiPlus size='20' />
                </IconButton>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <Dialog.Title>Create Workspace</Dialog.Title>
                <Dialog.Description>Workspaces allow you to organize your channels and teams.</Dialog.Description>
                <Stack>
                    <HStack>
                        <Dialog.Close>
                            <Button variant='soft' color='gray'>Close</Button>
                        </Dialog.Close>
                    </HStack>
                </Stack>
            </Dialog.Content>
        </Dialog.Root>
    }

    return <Drawer>
        <DrawerTrigger>
            <IconButton
                color='gray'
                variant='soft'>
                <FiPlus />
            </IconButton>
        </DrawerTrigger>
        <DrawerContent>
            <div className='pb-16 overflow-y-scroll min-h-96'>
                <DrawerTitle>Create Workspace</DrawerTitle>
                <DrawerDescription>Workspaces allow you to organize your channels and teams.</DrawerDescription>
            </div>
        </DrawerContent>
    </Drawer>
}

export default AddWorkspaceSidebarButton