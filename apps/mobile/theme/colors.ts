import { Platform } from 'react-native';

const IOS_SYSTEM_COLORS = {
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    light: {
        grey6: 'rgb(242, 242, 247)',
        grey5: 'rgb(230, 230, 235)',
        grey4: 'rgb(210, 210, 215)',
        grey3: 'rgb(199, 199, 204)',
        grey2: 'rgb(175, 176, 180)',
        grey: 'rgb(142, 142, 147)',
        background: 'rgb(255, 255, 255)',
        foreground: 'rgb(0, 0, 0)',
        root: 'rgb(255, 255, 255)',
        card: 'rgb(248, 248, 248)',
        icon: '#1C2024',
        greyText: 'rgb(175, 176, 180)',
        destructive: 'rgb(255, 56, 43)',
        primary: '#5753C6',
        secondary: "#DBDAFE",
        linkColor: '#F1F1F4'
    },
    dark: {
        grey6: 'rgb(21, 21, 24)',
        grey5: 'rgb(30, 30, 32)',
        grey4: 'rgb(55, 55, 57)',
        grey3: 'rgb(70, 70, 73)',
        grey2: 'rgb(99, 99, 102)',
        grey: 'rgb(142, 142, 147)',
        background: 'rgb(18, 18, 18)',
        foreground: 'rgb(255, 255, 255)',
        root: 'rgb(18, 18, 18)',
        card: 'rgb(26, 26, 29)',
        icon: '#B9BBC6',
        greyText: 'rgb(175, 176, 180)',
        destructive: 'rgb(254, 67, 54)',
        primary: '#5753C6',
        secondary: "#DBDAFE",
        linkColor: '#1A1A1A'
    },
} as const;

const ANDROID_COLORS = {
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    light: {
        grey6: 'rgb(242, 242, 247)',
        grey5: 'rgb(230, 230, 235)',
        grey4: 'rgb(210, 210, 215)',
        grey3: 'rgb(199, 199, 204)',
        grey2: 'rgb(175, 176, 180)',
        grey: 'rgb(142, 142, 147)',
        background: 'rgb(255, 255, 255)',
        foreground: 'rgb(0, 0, 0)',
        root: 'rgb(255, 255, 255)',
        card: 'rgb(248, 248, 248)',
        icon: '#1C2024',
        greyText: 'rgb(175, 176, 180)',
        destructive: 'rgb(255, 56, 43)',
        primary: '#5753C6',
        secondary: "#DBDAFE",
        linkColor: '#F1F1F4'
    },
    dark: {
        grey6: 'rgb(21, 21, 24)',
        grey5: 'rgb(30, 30, 32)',
        grey4: 'rgb(55, 55, 57)',
        grey3: 'rgb(70, 70, 73)',
        grey2: 'rgb(99, 99, 102)',
        grey: 'rgb(142, 142, 147)',
        background: 'rgb(18, 18, 18)',
        foreground: 'rgb(255, 255, 255)',
        root: 'rgb(18, 18, 18)',
        card: 'rgb(26, 26, 29)',
        icon: '#B9BBC6',
        greyText: 'rgb(175, 176, 180)',
        destructive: 'rgb(254, 67, 54)',
        primary: '#5753C6',
        secondary: "#DBDAFE",
        linkColor: '#1A1A1A'
    },
} as const;

const COLORS = Platform.OS === 'ios' ? IOS_SYSTEM_COLORS : ANDROID_COLORS;

export { COLORS };