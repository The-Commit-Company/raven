import { Loader } from "@/components/common/Loader"
import { Drawer, DrawerContent } from "@/components/layout/Drawer"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog, Flex } from "@radix-ui/themes"
import { lazy, Suspense } from "react"

const ViewFilesContent = lazy(() => import('./ViewFilesContent'))

export const ViewFilesButton = ({
    open,
    setOpen
}: {
    open: boolean,
    setOpen: (open: boolean) => void
}) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content className={`${DIALOG_CONTENT_CLASS} min-w-[64rem]`}>
                <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                    <ViewFilesContent />
                </Suspense>
            </Dialog.Content>
        </Dialog.Root>
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <Suspense fallback={<Flex align='center' justify='center' className="h-[80vh]"><Loader /></Flex>}>
                    <ViewFilesContent />
                </Suspense>
            </DrawerContent>
        </Drawer>
    }


}