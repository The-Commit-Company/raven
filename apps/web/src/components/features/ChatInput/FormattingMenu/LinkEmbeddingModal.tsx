/**
 * LinkEmbeddingModal.tsx - Modal for embedding a link in the editor
 *
 * Appears when user clicks the "Embed link" button in the text formatting bubble menu.
 * Contains a form for entering the link and text to be displayed.
 *
 */

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle, DialogDescription } from '@components/ui/dialog'
import { DataField } from '@components/ui/form-elements'
import { useForm } from 'react-hook-form'
import { Form } from "@components/ui/form"
import { Button } from '@components/ui/button'
import { useRef } from 'react'

type LinkEmbedding = {
    link: string
    text: string
}

type LinkEmbeddingModalProps = {
    isOpen: boolean
    onClose: () => void
    // text to be displayed in the input field
    linkModalData: { text: string, link: string },
    // onSubmit callback
    onSave: (data: LinkEmbedding) => void,
}

const LinkEmbeddingModal = ({ isOpen, onClose, linkModalData, onSave }: LinkEmbeddingModalProps) => {

    const form = useForm<LinkEmbedding>({
        defaultValues: {
            text: linkModalData.text ?? '',
            link: linkModalData.link ?? '',
        }
    })
    const { handleSubmit, formState: { isSubmitting }, reset } = form

    const prevIsRefOpen = useRef(isOpen)

    if (isOpen && !prevIsRefOpen.current) {
        reset({
            text: linkModalData.text ?? '',
            link: linkModalData.link ?? '',
        })
    }
    prevIsRefOpen.current = isOpen

    const onSubmit = (data: LinkEmbedding) => {
        // Use link as text if no text provided
        const linkData = {
            link: data.link,
            text: data.text.trim() || data.link
        }
        onSave(linkData)
        reset()
        onClose()
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Embed Link</DialogTitle>
                            <DialogDescription>
                                Embed a link in your message.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <DataField
                                name="text"
                                label="Text"
                                inputProps={{
                                    autoFocus: true,
                                    placeholder: "Enter display text",
                                    autoComplete: "off",
                                }}
                            />
                            <DataField
                                name="link"
                                label="Link"
                                rules={{
                                    required: "Link is required",
                                    pattern: {
                                        value: /^https?:\/\/[^\s]+$/,
                                        message: "Please enter a valid URL (must start with http:// or https://)",
                                    },
                                }}
                                inputProps={{
                                    placeholder: "https://example.com",
                                    type: "url",
                                    autoComplete: "off",
                                }}
                            />
                        </div>
                        <DialogFooter>
                        <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </form>
            </Form>
        </Dialog>
    )
}

export default LinkEmbeddingModal
