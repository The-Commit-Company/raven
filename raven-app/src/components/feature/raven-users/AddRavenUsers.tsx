import { Loader } from "@/components/common/Loader"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog, Flex } from "@radix-ui/themes"
import { lazy, Suspense } from "react"

const AddRavenUsersContent = lazy(() => import("./AddRavenUsersContent"))

export const AddRavenUsers = ({ isOpen, onOpenChange }: any) => {

    const onClose = () => {
        onOpenChange(false)
    }
    return <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
        <Dialog.Content className={`${DIALOG_CONTENT_CLASS} min-w-[64rem]`}>
            <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                <AddRavenUsersContent onClose={onClose} />
            </Suspense>
        </Dialog.Content>

    </Dialog.Root>

}