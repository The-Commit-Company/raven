import { Loader } from "@/components/common/Loader"
import { useBoolean } from "@/hooks/useBoolean"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog, Flex, IconButton, Tooltip } from "@radix-ui/themes"
import { lazy, Suspense } from "react"
import { BiFileBlank } from "react-icons/bi"

const ViewFilesContent = lazy(() => import('./ViewFilesContent'))

export const ViewFilesButton = () => {

    const [open, { }, setOpen] = useBoolean(false)

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Tooltip content='View Files'>
            <Dialog.Trigger>
                <IconButton color='gray' variant='ghost' className='h-6 w-6'>
                    <BiFileBlank className='text-xl' />
                </IconButton>
            </Dialog.Trigger>
        </Tooltip>
        <Dialog.Content className={`${DIALOG_CONTENT_CLASS} min-w-[64rem]`}>
            <Suspense fallback={<Flex align='center' justify='center' className="h-64"><Loader /></Flex>}>
                <ViewFilesContent />
            </Suspense>
        </Dialog.Content>
    </Dialog.Root>
}