import { Command, ChevronUp, ArrowBigUpDash, LucideProps, Option, Delete, CornerDownLeft, Space, ArrowRightToLine, ArrowBigUp, ArrowBigDown, ArrowBigLeft, ArrowBigRight } from 'lucide-react'

export const getKeyboardMetaKeyString = () => {
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        return '⌘'
    } else {
        return 'Ctrl'
    }
}
export type KEY_TYPE = 'shift' | 'ctrl' | 'alt' | 'meta' | 'left' | 'up' | 'right' | 'tab' | 'down' | 'space' | 'backspace' | 'delete' | 'del' | 'enter' | 'return'

export const KEYBOARD_KEY_STRING_MAP: Record<KEY_TYPE, string> = {
    'shift': '⇧',
    'ctrl': '⌃',
    'alt': '⌥',
    'meta': getKeyboardMetaKeyString(),
    'left': '←',
    'up': '↑',
    'right': '→',
    'tab': '⇥',
    'down': '↓',
    'space': '␣',
    'backspace': '⌫',
    'delete': '⌦',
    'del': '⌦',
    'enter': '⏎',
    'return': '⏎',

}
export const KeyboardMetaKeyIcon = ({ ...props }: LucideProps) => {
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        return <Command {...props} />
    } else {
        return <ChevronUp {...props} />
    }
}

interface KeyboardKeyIconProps extends LucideProps {
    key: KEY_TYPE
}
export const KeyboardKeyIcon = ({ key, ...props }: KeyboardKeyIconProps) => {
    switch (key) {
        case 'meta': return <KeyboardMetaKeyIcon {...props} />;
        case 'shift': return <ArrowBigUpDash {...props} />
        case 'ctrl': return <ChevronUp {...props} />
        case 'alt': return <Option {...props} />
        case 'backspace': return <Delete {...props} />
        case 'del': return <Delete {...props} />
        case 'delete': return <Delete {...props} />
        case 'return': return <CornerDownLeft {...props} />
        case 'enter': return <CornerDownLeft {...props} />
        case 'space': return <Space {...props} />
        case 'tab': return <ArrowRightToLine {...props} />
        case 'up': return <ArrowBigUp {...props} />
        case 'down': return <ArrowBigDown {...props} />
        case 'left': return <ArrowBigLeft {...props} />
        case 'right': return <ArrowBigRight {...props} />
    }
}