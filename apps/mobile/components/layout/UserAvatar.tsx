import { Avatar, AvatarFallback, AvatarImage } from '@components/nativewindui/Avatar'
import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { cn } from '@lib/cn'
import { getColorIndexForAvatar, getInitials } from '@raven/lib/utils/utils'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { FallbackProps, ImageProps } from '@rn-primitives/avatar'
import React, { useMemo } from 'react'
import { TextProps, View, ViewProps } from 'react-native'
import BotIcon from '@assets/icons/BotIcon.svg'

type Props = {
    alt: string,
    src?: string,
    isActive?: boolean,
    availabilityStatus?: RavenUser['availability_status'],
    isBot?: boolean,
    imageProps?: ImageProps
    fallbackProps?: FallbackProps
    textProps?: TextProps,
    indicatorProps?: ViewProps

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

const UserAvatar = ({ src, isActive, alt, availabilityStatus, isBot, imageProps, fallbackProps, textProps, indicatorProps }: Props) => {

    const source = useFileURL(src)
    const { bg, text, botColor } = useMemo(() => COLOR_MAP[getColorIndexForAvatar(alt)], [alt])

    return (
        <View className='relative mb-1.5'>
            <Avatar alt={alt}>
                <AvatarImage source={source} {...imageProps} />
                <AvatarFallback className={cn(bg, fallbackProps?.className)} {...fallbackProps}>
                    <Text {...textProps} className={cn(text, textProps?.className)}>
                        {getInitials(alt)}
                    </Text>
                </AvatarFallback>
            </Avatar>
            <ActiveIndicator isActive={isActive} availabilityStatus={availabilityStatus} isBot={isBot} botColor={botColor} {...indicatorProps} />
        </View>
    )
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
                return 'bg-green-500'
            }
        }
        if (isActive) {
            return 'bg-green-500'
        } else {
            return ''
        }

    }, [availabilityStatus, isActive])

    if (isBot) {
        console.log('botColor', botColor)
        return <View
            {...indicatorProps}
            className={cn('absolute bottom-1 right-0.5 translate-x-1/2 translate-y-1/2', botColor, indicatorProps?.className)}>
            <BotIcon height={16} width={16} fill={botColor} />
        </View>
    }

    if (!dotColor) return null

    return <View
        {...indicatorProps}
        className={cn('absolute bottom-0.5 right-0.5 translate-x-1/2 translate-y-1/2 rounded-full w-2 h-2', dotColor, indicatorProps?.className)}>
    </View>

}

export default UserAvatar