import { Loader } from "@/components/common/Loader"
import { Drawer, DrawerContent } from "@/components/layout/Drawer"
import { useCurrentEditor } from "@tiptap/react"
import { Suspense, lazy } from "react"

const GIFPicker = lazy(() => import('@/components/common/GIFPicker/GIFPicker'))

const AddGIFDrawer = ({
    isOpen,
    setIsOpen
}: {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
}) => {

    const { editor } = useCurrentEditor()

    const onGIFSelect = (gif: any) => {
        if (editor) {
            editor.chain().focus().setImage({ src: gif.media_formats.gif.url }).setHardBreak().run()
        }
        setIsOpen(false)
    }
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <div className='pb-4 overflow-auto'>
                    <Suspense fallback={<Loader />}>
                        <GIFPicker onSelect={onGIFSelect} />
                    </Suspense>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default AddGIFDrawer