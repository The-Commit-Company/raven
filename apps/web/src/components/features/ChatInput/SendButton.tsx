import { Button } from "@components/ui/button"
import { SendIcon } from "lucide-react"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"

type SendButtonProps = {
    onSend: () => void
    disabled?: boolean
    /** Send is held while attachments finish uploading — show a spinner. */
    loading?: boolean
}

/** Desktop: a full "Send" button (icon + label). Mobile: an icon-only button. */
const SendButton = ({ onSend, disabled, loading }: SendButtonProps) => {
    const isMobile = useIsMobile()
    return (
        <Button
            size="sm"
            type="button"
            onClick={onSend}
            disabled={disabled}
            loading={loading}
            loadingText={isMobile ? undefined : _("Sending...")}
            isIconButton={isMobile}
            aria-label={_("Send message")}
        >
            {/* While loading the Button shows its own spinner; don't also render content. */}
            {!loading && (
                <>
                    <SendIcon />
                    {!isMobile && <span>{_("Send")}</span>}
                </>
            )}
        </Button>
    )
}

export default SendButton
