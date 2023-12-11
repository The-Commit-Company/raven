import { IconBaseProps } from 'react-icons'
import { BiSpaceBar, BiCommand, BiChevronUp } from 'react-icons/bi'
import { BsOption, BsArrowReturnLeft } from 'react-icons/bs'
import { FiDelete } from 'react-icons/fi'
import { LuArrowBigLeft, LuArrowBigDown, LuArrowBigRight, LuArrowBigUp, LuArrowBigUpDash, LuArrowRightToLine } from 'react-icons/lu'

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
export const KeyboardMetaKeyIcon = ({ ...props }: IconBaseProps) => {
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        return <BiCommand {...props} />
    } else {
        return <BiChevronUp {...props} />
    }
}

interface KeyboardKeyIconProps extends IconBaseProps {
    key: KEY_TYPE
}
export const KeyboardKeyIcon = ({ key, ...props }: KeyboardKeyIconProps) => {
    switch (key) {
        case 'meta': return <KeyboardMetaKeyIcon {...props} />;
        case 'shift': return <LuArrowBigUpDash {...props} />
        case 'ctrl': return <BiChevronUp {...props} />
        case 'alt': return <BsOption {...props} />
        case 'backspace': return <FiDelete {...props} />
        case 'del': return <FiDelete {...props} />
        case 'delete': return <FiDelete {...props} />
        case 'return': return <BsArrowReturnLeft {...props} />
        case 'enter': return <BsArrowReturnLeft {...props} />
        case 'space': return <BiSpaceBar {...props} />
        case 'tab': return <LuArrowRightToLine {...props} />
        case 'up': return <LuArrowBigUp {...props} />
        case 'down': return <LuArrowBigDown {...props} />
        case 'left': return <LuArrowBigLeft {...props} />
        case 'right': return <LuArrowBigRight {...props} />
    }
}