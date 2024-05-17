import { Loader } from "@/components/common/Loader"
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

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content className={`${DIALOG_CONTENT_CLASS} min-w-[64rem]`}>
            <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                <ViewFilesContent />
            </Suspense>
        </Dialog.Content>
    </Dialog.Root>
}