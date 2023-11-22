import { Button, Tooltip } from "@radix-ui/themes"
interface EmojiButtonProps {
    emoji: string,
    label: string,
    onClick?: () => void
}

export const EmojiButton = ({ emoji, label, onClick }: EmojiButtonProps) => {
    return (
        <Tooltip content={label}>
            <Button size='1' onClick={onClick} variant='soft' color='gray' aria-label={label}>
                {emoji}
            </Button>
        </Tooltip>
    )
}