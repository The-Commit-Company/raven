import RenderHtml, { TRenderEngineConfig } from 'react-native-render-html';
import { useWindowDimensions, View } from 'react-native';
import { useMemo } from 'react';
import { useColorScheme } from '@hooks/useColorScheme';
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
        lineHeight: 24,
        fontSize: 16,
    },
    'code': {
        padding: 4,
        borderRadius: 4,
        lineHeight: 24,
        fontSize: 16,
    },
    'p': {
        marginBottom: 0,
        fontSize: 16,
        marginTop: 0,
        whiteSpace: 'pre',
        paddingBottom: 4,
        lineHeight: 24,
    },
    'ol': {
        marginTop: 2,
        marginBottom: 2,
        lineHeight: 24,
        fontSize: 16,
    },
    'ul': {
        marginTop: 2,
        marginBottom: 2,
        lineHeight: 24,
        fontSize: 16,
    },
    'img': {
        width: '200px',
        height: 'auto',
        display: 'flex',
        justifyContent: 'flex-start',
        margin: 0,
        padding: 0,
    },
    'a': {
        textDecorationLine: 'none',
        borderBottomWidth: 1,
        lineHeight: 24,
        fontSize: 16,
    },
    'pre': {
        padding: 8,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 4,
        lineHeight: 24,
        fontSize: 16,
    }
}

const lightThemeTagStyles = {
    'a': {
        color: 'rgb(87, 83, 198)',
        borderBottomWidth: 0,
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
        borderBottomWidth: 0,
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

const renderers = {
    span: CustomMentionRenderer
}

const classesStylesLight = {
    'mention': {
        color: '#3A5BC7',
        backgroundColor: '#EDF2FE',
    }
}

const classesStylesDark = {
    'mention': {
        color: '#8DA4EF',
        backgroundColor: '#182449',
    }
}

const MessageTextRenderer = ({ text }: Props) => {

    const { width } = useWindowDimensions()

    const { colorScheme } = useColorScheme()

    const { tagStyles, baseStyles, classesStyles } = useMemo(() => {
        if (colorScheme === 'light') {
            return {
                tagStyles: lightThemeStyles,
                baseStyles: {
                    fontSize: 16,
                    color: 'rgb(0, 0, 0)'
                },
                classesStyles: classesStylesLight
            }
        } else {
            return {
                tagStyles: darkThemeStyles,
                baseStyles: {
                    fontSize: 16,
                    color: 'rgb(255, 255, 255)'
                },
                classesStyles: classesStylesDark
            }
        }
    }, [colorScheme])

    const source = useMemo(() => ({ html: text }), [text])
    const paddingWidth = width - 160

    return (
        <View className='flex-1 pt-0.5'>
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