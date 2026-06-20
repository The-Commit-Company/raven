import { Button } from "@components/ui/button"
import { SendIcon } from "lucide-react"

type SendButtonProps = {
    onSend: () => void
    disabled?: boolean
}

const SendButton = ({ onSend, disabled }: SendButtonProps) => {
    return (
        <div className="flex items-center justify-center">
            <Button size="sm" isIconButton type="button" onClick={onSend} disabled={disabled} aria-label="Send message">
                <SendIcon />
            </Button>
        </div>
    )
}

export default SendButton
