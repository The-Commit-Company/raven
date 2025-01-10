import RenderHtml, { TRenderEngineConfig } from 'react-native-render-html';
import { useWindowDimensions, View } from 'react-native';
import { useMemo } from 'react';
import { useAtomValue, atom } from 'jotai';
import { themeAtom } from '@hooks/useColorScheme';
import { CustomMentionRenderer } from './MentionRenderer';
type Props = {
    text: string
}

const TAG_BASE_STYLES: TRenderEngineConfig['tagsStyles'] = {
    'blockquote': {
        borderLeftWidth: 2,
        paddingLeft: 10,
        paddingTop: 4,
        paddingBottom: 2,
        fontStyle: 'italic',
        marginLeft: 4,
    },
    'code': {
        padding: 4,
        borderRadius: 4,
    },
    'p': {
        marginBottom: 0,
        marginTop: 0,
        whiteSpace: 'pre',
        paddingBottom: 4,
    },
    'ol': {
        marginTop: 2,
        marginBottom: 2,
    },
    'ul': {
        marginTop: 2,
        marginBottom: 2,
    },
    'img': {
        width: '200px',
        height: 'auto',
        margin: 0,
        padding: 0
    },
    'a': {
        textDecorationLine: 'none',
        borderBottomWidth: 1,
    },
    'pre': {
        padding: 8,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 4,
    }
}

const lightThemeTagStyles = {
    'a': {
        color: 'rgb(87, 83, 198)',
        borderBottomColor: 'rgba(87, 83, 198, 0.8)',
    },
    'blockquote': {
        borderLeftColor: 'rgba(87, 83, 198, 0.5)',
    },
    'pre': {
        backgroundColor: 'rgb(248, 248, 248)',
    },
    'code': {
        backgroundColor: 'rgb(248, 248, 248)',
        color: '#C10030DB',
    },
    'mark': {
        backgroundColor: '#FFE629',
    }
}

const darkThemeTagStyles = {
    'a': {
        color: '#B1A9FF',
        borderBottomColor: '#B1A9FF88',
    },
    'blockquote': {
        borderLeftColor: '#6E6ADE',
    },
    'pre': {
        backgroundColor: '#202020',
    },
    'code': {
        backgroundColor: '#202020',
        color: '#FF949D',
    },
    'mark': {
        backgroundColor: '#FFFF57',
    }
}

const lightThemeStyles: TRenderEngineConfig['tagsStyles'] = Object.keys(TAG_BASE_STYLES).reduce((acc, key) => {
    // @ts-ignore
    acc[key] = { ...TAG_BASE_STYLES[key], ...(lightThemeTagStyles?.[key] || {}) }
    return acc
}, {} as TRenderEngineConfig['tagsStyles'])

const darkThemeStyles: TRenderEngineConfig['tagsStyles'] = Object.keys(TAG_BASE_STYLES).reduce((acc, key) => {
    // @ts-ignore
    acc[key] = { ...TAG_BASE_STYLES[key], ...(darkThemeTagStyles?.[key] || {}) }
    return acc
}, {} as TRenderEngineConfig['tagsStyles'])

// Create a read only theme atom value for the tagStyles

const tagStylesAtom = atom((get) => {
    return get(themeAtom) === 'light' ? lightThemeStyles : darkThemeStyles
})

const baseStylesAtom = atom((get) => ({
    fontSize: 14,
    color: get(themeAtom) === 'light' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
}))

const renderers = {
    span: CustomMentionRenderer
}

const classesStylesLight = {
    'mention': {
        color: 'rgb(87, 83, 198)',
    }
}

const classesStylesDark = {
    'mention': {
        color: '#B1A9FF',
    }
}

const classesStylesAtom = atom((get) => {
    return get(themeAtom) === 'light' ? classesStylesLight : classesStylesDark
})

const MessageTextRenderer = ({ text }: Props) => {

    const { width } = useWindowDimensions()

    const tagStyles = useAtomValue(tagStylesAtom)
    const baseStyles = useAtomValue(baseStylesAtom)
    const classesStyles = useAtomValue(classesStylesAtom)

    const source = useMemo(() => ({ html: text }), [text])
    const paddingWidth = width - 160

    return (
        <View className='flex-1'>
            <RenderHtml
                baseStyle={baseStyles}
                contentWidth={paddingWidth}
                source={source}
                classesStyles={classesStyles}
                tagsStyles={tagStyles}
                renderers={renderers}
            />
        </View>
    );
}

export default MessageTextRenderer