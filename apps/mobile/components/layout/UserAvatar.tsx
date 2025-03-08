import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { cn } from '@lib/cn'
import { getColorIndexForAvatar, getInitials } from '@raven/lib/utils/utils'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, TextProps, View, ViewProps } from 'react-native'
import { Image, ImageSource, ImageProps } from 'expo-image'
import BotIcon from '@assets/icons/BotIcon.svg'

type Props = {
    alt: string,
    src?: string,
    isActive?: boolean,
    availabilityStatus?: RavenUser['availability_status'],
    isBot?: boolean,
    imageProps?: ImageProps
    fallbackProps?: ViewProps
    textProps?: TextProps,
    indicatorProps?: ViewProps,
    avatarProps?: ViewProps,
    rounded?: boolean
}

// These need to kept here since Nativewind/Tailwind needs the variables in the source file to be defined to compile
const COLOR_MAP: { name: string, bg: string, text: string, botColor: string }[] = [
    { name: 'red', bg: 'bg-red-400', text: 'text-red-100', botColor: '#7F1D1D' },
    { name: 'rose', bg: 'bg-rose-400', text: 'text-rose-100', botColor: '#881337' },
    { name: 'pink', bg: 'bg-pink-400', text: 'text-pink-100', botColor: '#831843' },
    { name: 'purple', bg: 'bg-purple-400', text: 'text-purple-100', botColor: '#581C87' },
    { name: 'violet', bg: 'bg-violet-400', text: 'text-violet-100', botColor: '#4C1D95' },
    { name: 'indigo', bg: 'bg-indigo-400', text: 'text-indigo-100', botColor: '#312E81' },
    { name: 'blue', bg: 'bg-blue-400', text: 'text-blue-100', botColor: '#1E3A8A' },
    { name: 'cyan', bg: 'bg-cyan-400', text: 'text-cyan-100', botColor: '#164E63' },
    { name: 'teal', bg: 'bg-teal-400', text: 'text-teal-100', botColor: '#134E4A' },
    { name: 'green', bg: 'bg-green-400', text: 'text-green-100', botColor: '#14532D' },
    { name: 'orange', bg: 'bg-orange-400', text: 'text-orange-100', botColor: '#7C2D12' },
    { name: 'sky', bg: 'bg-sky-400', text: 'text-sky-100', botColor: '#0C4A6E' },
    { name: 'emerald', bg: 'bg-emerald-400', text: 'text-emerald-100', botColor: '#064E3B' },
    { name: 'lime', bg: 'bg-lime-400', text: 'text-lime-100', botColor: '#365314' },
    { name: 'yellow', bg: 'bg-yellow-400', text: 'text-yellow-100', botColor: '#713F12' },
    { name: 'amber', bg: 'bg-amber-400', text: 'text-amber-100', botColor: '#78350F' },
    { name: 'gray', bg: 'bg-gray-400', text: 'text-gray-100', botColor: '#111827' }
]

const UserAvatar = ({ src, isActive, alt, availabilityStatus, isBot, imageProps, fallbackProps, textProps, indicatorProps, avatarProps, rounded = false }: Props) => {

    const source = useFileURL(src)
    const { bg, text, botColor } = useMemo(() => COLOR_MAP[getColorIndexForAvatar(alt)], [alt])

    // If there is no source, we need to show the fallback immediately - most common use case of there being a fallback
    const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>(source ? 'loading' : 'error')

    const onDisplay = useCallback(() => {
        setStatus('loaded')
    }, [])

    const onError = useCallback(() => {
        setStatus('error')
    }, [])

    return (
        <View {...avatarProps} className={cn('relative w-10 h-10', avatarProps?.className)}>
            {status === 'error' ? <View {...fallbackProps} className={cn('flex h-full w-full items-center justify-center rounded-lg', bg, fallbackProps?.className)}>
                <Text {...textProps} className={cn(text, textProps?.className)}>
                    {getInitials(alt)}
                </Text>
            </View> : null}
            <ImageComponent
                {...imageProps}
                status={status}
                source={source}
                alt={alt}
                onDisplay={onDisplay}
                onError={onError}
                rounded={rounded} />
            <ActiveIndicator isActive={isActive} availabilityStatus={availabilityStatus} isBot={isBot} botColor={botColor} indicatorProps={indicatorProps} />
        </View>
    )
}

/** Uses expo-image to handle caching the image */
const ImageComponent = ({ status, source, alt, onDisplay, onError, rounded, ...props }: ImageProps & { status: 'error' | 'loaded' | 'loading', source?: ImageSource, alt: string, onDisplay: () => void, onError: () => void, rounded?: boolean } & ImageProps) => {

    if (!source) return null
    if (status === 'error') return null

    return <Image
        source={source}
        alt={alt}
        style={{
            flex: 1,
            width: '100%',
            height: '100%',
            borderRadius: rounded ? 40 : 6,
            aspectRatio: 1,
        }}
        onDisplay={onDisplay}
        onError={onError}
        {...props}
    />
}

const ActiveIndicator = ({ isActive, availabilityStatus, isBot, botColor, indicatorProps }: Pick<Props, 'isActive' | 'availabilityStatus' | 'isBot'> & { indicatorProps?: ViewProps, botColor?: string }) => {

    const dotColor = useMemo(() => {

        if (availabilityStatus) {
            if (availabilityStatus === 'Away') {
                return 'bg-yellow-500'
            } else if (availabilityStatus === 'Do not disturb') {
                return 'bg-red-500'
            } else if (availabilityStatus === 'Invisible') {
                return ''
            } else if (availabilityStatus === 'Available') {
                return 'bg-[#3E9B4F]'
            }
        }
        if (isActive) {
            return 'bg-[#3E9B4F]'
        } else {
            return ''
        }

    }, [availabilityStatus, isActive])

    if (isBot) {
        return <View
            {...indicatorProps}
            className={cn('absolute bottom-1 right-0.5 translate-x-1/2 translate-y-1/2', botColor, indicatorProps?.className)}>
            <BotIcon height={16} width={16} fill={botColor} />
        </View>
    }

    if (!dotColor) return null

    return <View
        {...indicatorProps}
        className={cn('absolute bottom-0.5 right-0.5 translate-x-1/2 translate-y-1/2 rounded-full w-2.5 h-2.5 border  border-card', dotColor, indicatorProps?.className)}>
    </View>

}

export default UserAvatar