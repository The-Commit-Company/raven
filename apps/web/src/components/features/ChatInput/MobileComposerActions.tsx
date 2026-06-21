import { useRef, useState } from "react"
import { Plus, Paperclip, Type, BarChart3, FileBox, type LucideIcon } from "lucide-react"
import { Button } from "@components/ui/button"
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@components/ui/drawer"
import { useAttachFile } from "./useFileInput"
import { CreatePollDialog } from "./CreatePollDialog"
import AttachFrappeDocumentDialog from "./AttachFrappeDocumentDialog"
import _ from "@lib/translate"

/**
 * Mobile composer overflow: a single "+" opens a bottom sheet with the secondary
 * actions (attach file, formatting, poll, document). Keeps the composer row to
 * "+ | input | send" on narrow screens. The poll/document dialogs are driven in
 * controlled mode (their triggers live here as sheet rows); file attach reuses the
 * shared useAttachFile path, so size/type validation still applies.
 */
export const MobileComposerActions = ({
    channelID,
    onToggleFormatting,
}: {
    channelID: string
    onToggleFormatting: () => void
}) => {
    const [sheetOpen, setSheetOpen] = useState(false)
    const [pollOpen, setPollOpen] = useState(false)
    const [docOpen, setDocOpen] = useState(false)
    const onAddFile = useAttachFile(channelID)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const rows: { icon: LucideIcon; label: string; onClick: () => void }[] = [
        { icon: Paperclip, label: _("Attach file"), onClick: () => fileInputRef.current?.click() },
        { icon: Type, label: _("Formatting"), onClick: onToggleFormatting },
        { icon: BarChart3, label: _("Create a poll"), onClick: () => setPollOpen(true) },
        { icon: FileBox, label: _("Attach a document"), onClick: () => setDocOpen(true) },
    ]

    return (
        <>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) onAddFile(e.target.files)
                    e.target.value = ""
                }}
            />

            <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
                <DrawerTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" isIconButton aria-label={_("More actions")}>
                        <Plus />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerTitle className="sr-only">{_("Composer actions")}</DrawerTitle>
                    <div className="flex flex-col gap-1 p-3 pb-6">
                        {rows.map((row) => (
                            <Button
                                key={row.label}
                                variant="ghost"
                                size="md"
                                className="w-full justify-start gap-3"
                                onClick={() => {
                                    setSheetOpen(false)
                                    row.onClick()
                                }}
                            >
                                <row.icon />
                                {row.label}
                            </Button>
                        ))}
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Controlled dialogs opened from the sheet rows (triggers hidden). */}
            <CreatePollDialog channelID={channelID} open={pollOpen} onOpenChange={setPollOpen} hideTrigger />
            <AttachFrappeDocumentDialog open={docOpen} onOpenChange={setDocOpen} hideTrigger />
        </>
    )
}
