import { Button, Tooltip } from "@chakra-ui/react"

interface EmojiButtonProps {
    emoji: string,
    label: string,
    onClick?: () => void
}

export const EmojiButton = ({ emoji, label, onClick }: EmojiButtonProps) => {
    return (
        <Tooltip hasArrow label={label} size='xs' placement='top' rounded='md'>
            <Button size='xs' fontSize='md' onClick={onClick}>
                {emoji}
            </Button>
        </Tooltip>
    )
}