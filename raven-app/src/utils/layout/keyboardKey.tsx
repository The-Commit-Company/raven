import { IconType } from "react-icons"
import { BsArrowReturnLeft, BsOption } from "react-icons/bs"
import { ImArrowDown2, ImArrowLeft2, ImArrowRight2, ImArrowUp2, ImCommand, ImCtrl, ImShift } from "react-icons/im"
import { IoBackspaceOutline } from "react-icons/io5"
import { MdKeyboardTab, MdOutlineSpaceBar } from "react-icons/md"

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
export const getKeyboardMetaKeyIcon = () => {
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        return ImCommand
    } else {
        return ImCtrl
    }
}
export const KEYBOARD_KEY_ICON_MAP: Record<KEY_TYPE, IconType> = {
    'shift': ImShift,
    'ctrl': ImCtrl,
    'alt': BsOption,
    'meta': getKeyboardMetaKeyIcon(),
    'left': ImArrowLeft2,
    'up': ImArrowUp2,
    'right': ImArrowRight2,
    'tab': MdKeyboardTab,
    'down': ImArrowDown2,
    'space': MdOutlineSpaceBar,
    'backspace': IoBackspaceOutline,
    'delete': IoBackspaceOutline,
    'del': IoBackspaceOutline,
    'enter': BsArrowReturnLeft,
    'return': BsArrowReturnLeft,

}