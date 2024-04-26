import { Loader } from "@/components/common/Loader"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog, Flex } from "@radix-ui/themes"
import { lazy, Suspense } from "react"

const SetCustomStatusContent = lazy(() => import("./SetCustomStatusContent"))

export const SetCustomStatusModal = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {

    const onClose = () => {
        onOpenChange(false)
    }

    return <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
        <Dialog.Content className={`${DIALOG_CONTENT_CLASS} w-96`}>
            <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                <SetCustomStatusContent onClose={onClose} />
            </Suspense>
        </Dialog.Content>
    </Dialog.Root>

}