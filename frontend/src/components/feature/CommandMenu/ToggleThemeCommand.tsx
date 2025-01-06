import { useTheme } from '@/ThemeProvider'
import { Command } from 'cmdk'
import { useSetAtom } from 'jotai'
import { BiMoon, BiSun } from 'react-icons/bi'
import { commandMenuOpenAtom } from './CommandMenu'

const ToggleThemeCommand = () => {

    const { appearance, setAppearance } = useTheme()

    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        setAppearance(appearance === 'light' ? 'dark' : 'light')
        setOpen(false)
    }

    return (
        <Command.Item onSelect={onSelect}>
            {appearance === 'light' ? <BiMoon size={16} /> : <BiSun size={16} />}
            Toggle Theme
        </Command.Item>
    )
}

export default ToggleThemeCommand