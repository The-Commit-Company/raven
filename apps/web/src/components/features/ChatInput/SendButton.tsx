import { Button } from "@components/ui/button"
import { SendIcon } from "lucide-react"

type SendButtonProps = {
    onSend: () => void
    disabled?: boolean
    /** Send is held while attachments finish uploading — show a spinner. */
    loading?: boolean
}

const SendButton = ({ onSend, disabled, loading }: SendButtonProps) => {
    return (
        <div className="flex items-center justify-center">
            <Button size="sm" isIconButton type="button" onClick={onSend} disabled={disabled} loading={loading} aria-label="Send message">
                {/* While loading the Button shows its own spinner; don't also render the icon. */}
                {!loading && <SendIcon />}
            </Button>
        </div>
    )
}

export default SendButton
