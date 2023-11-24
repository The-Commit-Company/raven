import { useTheme } from '@/ThemeProvider'

export const useModalContentStyle = (className: string = '') => {
    const { appearance } = useTheme()

    const contentClass = appearance === 'dark' ? 'backdrop-blur-[8px] bg-[var(--color-panel)]' : ''

    return contentClass + ' ' + className
}