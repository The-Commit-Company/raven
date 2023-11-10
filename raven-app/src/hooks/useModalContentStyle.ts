import { useTheme } from '@/ThemeProvider'

export const useModalContentStyle = (className: string = '') => {
    const { appearance } = useTheme()

    const contentClass = appearance === 'dark' ? 'backdrop-blur-md bg-[var(--color-panel)]' : ''

    return contentClass + ' ' + className
}