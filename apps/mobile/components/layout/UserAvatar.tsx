import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { cn } from '@lib/cn'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TextProps, View, ViewProps } from 'react-native'
import { Image, ImageSource, ImageProps } from 'expo-image'
import BotIcon from '@assets/icons/BotIcon.svg'
import { getHashOfString, getInitials, normalizeHash } from '@raven/lib/utils/utils'
import { useColorScheme } from '@hooks/useColorScheme'

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
    borderRadius?: number
}


// These need to kept here since Nativewind/Tailwind needs the variables in the source file to be defined to compile
const COLOR_MAP: { name: string, bg: string, text: string, botColor: string, botColorDark: string }[] = [
    { name: 'tomato', bg: 'bg-[#F52B0018] dark:bg-[#FF35232B]', text: 'text-[#CD2200EA] dark:text-[#FF977D]', botColor: '#CD2200EA', botColorDark: '#FF977D' },
    { name: 'red', bg: 'bg-[#F3000D14] dark:bg-[#FF173F2D]', text: 'text-[#C40006D3] dark:text-[#FF9592]', botColor: '#C40006D3', botColorDark: '#FF9592' },
    { name: 'ruby', bg: 'bg-[#F3002515] dark-bg-[#FF235D2C]', text: 'text-[#C10030DB] dark:text-[#FF949D]', botColor: '#C10030DB', botColorDark: '#FF949D' },
    { name: 'crimson', bg: 'bg-[#FF005216] dark:bg-[#FE2A8B2A]', text: 'text-[#C4004FE2] dark:text-[#FF92AD]', botColor: '#C4004FE2', botColorDark: '#FF92AD' },
    { name: 'pink', bg: 'bg-[#F4008C16] dark:bg-[#FE37CC29]', text: 'text-[#B60074D6] dark:text-[#FF8DCC]', botColor: '#B60074D6', botColorDark: '#FF8DCC' },
    { name: 'plum', bg: 'bg-[#CC00CC14] dark:bg-[#FD4CFD27]', text: 'text-[#730086C1] dark:text-[#F19CFEF3]', botColor: '#730086C1', botColorDark: '#F19CFEF3' },
    { name: 'purple', bg: 'bg-[#8E00F112] dark:bg-[#C150FF2D]', text: 'text-[#52009ABA] dark:text-[#D19DFF]', botColor: '#52009ABA', botColorDark: '#D19DFF' },
    { name: 'violet', bg: 'bg-[#4400EE0F] dark:bg-[#8354FE36]', text: 'text-[#1F0099AF] dark:text-[#BAA7FF]', botColor: '#1F0099AF', botColorDark: '#BAA7FF' },
    { name: 'iris', bg: 'bg-[#0011EE0F] dark:bg-[#525BFF3B]', text: 'text-[#0600ABAC] dark:text-[#B1A9FF]', botColor: '#0600ABAC', botColorDark: '#B1A9FF' },
    { name: 'indigo', bg: 'bg-[#0047F112] dark:bg-[#2F62FF3C]', text: 'text-[#002BB7C5] dark:text-[#9EB1FF]', botColor: '#002BB7C5', botColorDark: '#9EB1FF' },
    { name: 'blue', bg: 'bg-[#008FF519] dark:bg-[#0077FF3A]', text: 'text-[#006DCBF2] dark:text-[#70B8FF]', botColor: '#006DCBF2', botColorDark: '#70B8FF' },
    { name: 'cyan', bg: 'bg-[#00C2D121] dark:bg-[#00BEFD28]', text: 'text-[#007491EF] dark:text-[#52E1FEE5]', botColor: '#007491EF', botColorDark: '#52E1FEE5' },
    { name: 'teal', bg: 'bg-[#00C69D1F] dark:bg-[#00FFE61E]', text: 'text-[#008573] dark:text-[#0AFED5D6]', botColor: '#008573', botColorDark: '#0AFED5D6' },
    { name: 'jade', bg: 'bg-[#00AE4819] dark:bg-[#02F99920]', text: 'text-[#007152DF] dark:text-[#21FEC0D6]', botColor: '#007152DF', botColorDark: '#21FEC0D6' },
    { name: 'green', bg: 'bg-[#00A43319] dark:bg-[#22FF991E]', text: 'text-[#00713FDE] dark:text-[#46FEA5D4]', botColor: '#00713FDE', botColorDark: '#46FEA5D4' },
    { name: 'grass', bg: 'bg-[#00970016] dark:bg-[#70FE8C1B]', text: 'text-[#006514D5] dark:text-[#89FF9FCD]', botColor: '#006514D5', botColorDark: '#89FF9FCD' },
    { name: 'brown', bg: 'bg-[#A04B0018] dark:bg-[#FCB58C19]', text: 'text-[#522100B9] dark:text-[#FED1AAD9]', botColor: '#522100B9', botColorDark: '#FED1AAD9' },
    { name: 'orange', bg: 'bg-[#FF9C0029] dark:bg-[#FB6A0025]', text: 'text-[#CC4E00] dark:text-[#FFA057]', botColor: '#CC4E00', botColorDark: '#FFA057' },
    { name: 'sky', bg: 'bg-[#00B3EE1E] dark:bg-[#1184FC33]', text: 'text-[#00749E] dark:text-[#7CD3FFEF]', botColor: '#00749E', botColorDark: '#7CD3FFEF' },
    { name: 'mint', bg: 'bg-[#00D29E22] dark:bg-[#00FFF61D]', text: 'text-[#007763FD] dark:text-[#67FFDED2]', botColor: '#007763FD', botColorDark: '#67FFDED2' },
    { name: 'lime', bg: 'bg-[#96C80029] dark:bg-[#9BFD4C1A]', text: 'text-[#375F00D0] dark:text-[#D1FE77E4]', botColor: '#375F00D0', botColorDark: '#D1FE77E4' },
    { name: 'yellow', bg: 'bg-[#FFEE0047] dark:bg-[#FFAA001E]', text: 'text-[#9E6C00] dark:text-[#FEE949F5]', botColor: '#9E6C00', botColorDark: '#FEE949F5' },
    { name: 'amber', bg: 'bg-[#FFDE003D] dark:bg-[#FA820022]', text: 'text-[#AB6400] dark:text-[#FFCA16]', botColor: '#AB6400', botColorDark: '#FFCA16' },
    { name: 'gold', bg: 'bg-[#75600018] dark:bg-[#F8ECBB15]', text: 'text-[#362100B4] dark:text-[#FEE7C6C8]', botColor: '#362100B4', botColorDark: '#FEE7C6C8' },
    { name: 'bronze', bg: 'bg-[#92250015] dark:bg-[#FACEB817]', text: 'text-[#3D0F00AB] dark:text-[#FFD7C6D1]', botColor: '#3D0F00AB', botColorDark: '#FFD7C6D1' },
    { name: 'gray', bg: 'bg-[#0000000F] dark:bg-[#FFFFFF12]', text: 'text-[#0000009B] dark:text-[#FFFFFFAF]', botColor: '#0000009B', botColorDark: '#FFFFFFAF' }
]

// Get a color index based on the hashed name
const getColorIndexForAvatar = (name: string): number => {
    if (!name) return 0
    const hash = getHashOfString(name)
    return normalizeHash(hash, 0, COLOR_MAP.length) // Map the hash to a valid index
}

const UserAvatar = ({ src, isActive, alt, availabilityStatus, isBot, imageProps, fallbackProps, textProps, indicatorProps, avatarProps, borderRadius }: Props) => {

    const source = useFileURL(src)
    const { bg, text, botColor, botColorDark } = useMemo(() => COLOR_MAP[getColorIndexForAvatar(alt)], [alt])

    // If there is no source, we need to show the fallback immediately - most common use case of there being a fallback
    const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>(source ? 'loading' : 'error')

    // Update status when source changes
    useEffect(() => {
        if (!source) {
            setStatus('error')
        } else {
            setStatus('loading')
        }
    }, [source])

    const onDisplay = useCallback(() => {
        setStatus('loaded')
    }, [])

    const onError = useCallback(() => {
        setStatus('error')
    }, [])

    return (
        <View {...avatarProps} className={cn('relative w-10 h-10', avatarProps?.className)}>
            {status === 'error' ? <View {...fallbackProps}
                className={cn('flex h-full w-full items-center justify-center rounded-[4px]', bg, fallbackProps?.className)}>
                <Text {...textProps}
                    className={cn(
                        text,
                        textProps?.className
                    )}
                >
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
                borderRadius={borderRadius} />
            <ActiveIndicator isActive={isActive} availabilityStatus={availabilityStatus} isBot={isBot} botColor={botColor} botColorDark={botColorDark} indicatorProps={indicatorProps} />
        </View>
    )
}

/** Uses expo-image to handle caching the image */
const ImageComponent = ({ status, source, alt, onDisplay, onError, borderRadius = 6, ...props }: ImageProps & { status: 'error' | 'loaded' | 'loading', source?: ImageSource, alt: string, onDisplay: () => void, onError: () => void, borderRadius?: number } & ImageProps) => {

    if (!source) return null
    if (status === 'error') return null

    return <Image
        source={source}
        alt={alt}
        style={{
            flex: 1,
            width: '100%',
            height: '100%',
            borderRadius: borderRadius,
            aspectRatio: 1,
        }}
        onDisplay={onDisplay}
        onError={onError}
        {...props}
    />
}

const ActiveIndicator = ({ isActive, availabilityStatus, isBot, botColor, botColorDark, indicatorProps }: Pick<Props, 'isActive' | 'availabilityStatus' | 'isBot'> & { indicatorProps?: ViewProps, botColor?: string, botColorDark?: string }) => {

    const { colorScheme } = useColorScheme()
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
            <BotIcon height={16} width={16} fill={colorScheme === 'dark' ? botColorDark : botColor} />
        </View>
    }

    if (!dotColor) return null

    return <View
        {...indicatorProps}
        className={cn('absolute bottom-0.5 right-0.5 translate-x-1/2 translate-y-1/2 rounded-full w-2.5 h-2.5 border  border-card', dotColor, indicatorProps?.className)}>
    </View>

}

export default UserAvatar