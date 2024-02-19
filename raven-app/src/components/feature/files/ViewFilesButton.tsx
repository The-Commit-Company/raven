import { Loader } from "@/components/common/Loader"
import { useBoolean } from "@/hooks/useBoolean"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Button, Dialog, Flex, Tooltip } from "@radix-ui/themes"
import { lazy, Suspense } from "react"
import { BiFile } from "react-icons/bi"

const ViewFilesContent = lazy(() => import('./ViewFilesContent'))

export const ViewFilesButton = () => {

    const [open, { }, setOpen] = useBoolean(false)

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Tooltip content='view files'>
            <Dialog.Trigger>
                <Button
                    color='gray'
                    size='2'
                    variant='soft'
                    aria-label="view files">
                    <BiFile />
                    Files
                </Button>
            </Dialog.Trigger>
        </Tooltip>
        <Dialog.Content className={`${DIALOG_CONTENT_CLASS} min-w-[64rem]`}>
            <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                <ViewFilesContent />
            </Suspense>
        </Dialog.Content>
    </Dialog.Root>
}