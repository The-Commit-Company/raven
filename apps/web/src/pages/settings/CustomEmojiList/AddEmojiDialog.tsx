import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@components/ui/dialog"
import { Form } from "@components/ui/form"
import { DataField } from "@components/ui/form-elements"
import { Button } from "@components/ui/button"
import ErrorBanner from "@components/ui/error-banner"
import { useForm } from "react-hook-form"
import { FrappeConfig, FrappeContext, useFrappeCreateDoc } from "frappe-react-sdk"
import { Loader2 } from "lucide-react"
import { useContext } from "react"

interface AddEmojiFormData {
    emoji_name: string
    keywords: string
}

interface AddCustomEmojiDialogProps {
    open: boolean
    onClose: (refresh?: boolean) => void
}

/**
 * Dialog for adding a new custom emoji.
 * Currently supports emoji name and keywords.
 * TODO: File upload and wire up to file upload component in createDoc.
 */
const AddCustomEmojiDialog = ({ open, onClose }: AddCustomEmojiDialogProps) => {
    const form = useForm<AddEmojiFormData>({
        defaultValues: {
            emoji_name: "",
            keywords: "",
        },
        mode: "onBlur",
    })

    const { call } = useContext(FrappeContext) as FrappeConfig
    const { createDoc, loading, error, reset: resetError } = useFrappeCreateDoc()

    const onSubmit = async (data: AddEmojiFormData) => {
        try {
            const exists = await checkIfEmojiNameExists(data.emoji_name)
            if (exists) {
                form.setError('emoji_name', { message: `Emoji ${data.emoji_name} already exists.` })
                return
            }

            // create the emoji
            await createDoc("Raven Custom Emoji", {
                emoji_name: data.emoji_name,
                keywords: data.keywords,
                // TODO: Add image field when file upload is implemented
                image: "/assets/raven/raven-logo.png", // Placeholder
            })
            form.reset()
            // close the dialog and refresh the emoji list
            onClose(true)
        } catch {
            // Error is handled by useFrappeCreateDoc
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset()
            resetError()
            onClose(false)
        }
    }

    const checkIfEmojiNameExists = async (name: string) => {
        const emoji = await call.get('frappe.client.get_count', {
            doctype: 'Raven Custom Emoji',
            filters: {
                emoji_name: name
            }
        })
        return emoji?.message > 0
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Emoji</DialogTitle>
                    <DialogDescription>
                        Add a custom emoji to use in your chats and reactions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        {error && <ErrorBanner error={error} />}

                        {/* TODO: Add file upload component here */}
                        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                            File upload coming soon.
                            <br />
                            128px × 128px PNG, SVG or GIF recommended.
                        </div>

                        <DataField
                            name="emoji_name"
                            label="Emoji Name"
                            isRequired
                            rules={{
                                required: "Name is required",
                                maxLength: {
                                    value: 20,
                                    message: "Name must be less than 20 characters",
                                },
                                pattern: {
                                    value: /^[a-z0-9_]+$/,
                                    message: "Only lowercase letters, numbers, and underscores allowed",
                                },
                            }}
                            inputProps={{
                                placeholder: "e.g. party_parrot",
                                autoComplete: "off",
                            }}
                        />

                        <DataField
                            name="keywords"
                            label="Keywords"
                            formDescription="You will be able to search for this emoji by these keywords.(Optional)"
                            inputProps={{
                                placeholder: "e.g. party, celebrate, dance",
                                autoComplete: "off",
                            }}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomEmojiDialog
