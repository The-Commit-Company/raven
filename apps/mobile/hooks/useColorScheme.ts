import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { COLORS } from '@theme/colors';
import { useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from "@react-native-async-storage/async-storage"

const themeAsyncAtom = atomWithStorage<'light' | 'dark' | 'system' | undefined>('theme', 'system',
    createJSONStorage(() => AsyncStorage), {
    getOnInit: true
});

export const themeAtom = loadable(themeAsyncAtom);

function useColorScheme() {

    const { colorScheme } = useNativewindColorScheme();

    const [theme, setTheme] = useAtom(themeAsyncAtom);

    async function setColorScheme(colorScheme: 'light' | 'dark' | 'system') {
        setTheme(colorScheme);
    }

    return {
        themeValue: theme,
        colorScheme: colorScheme ?? 'light',
        isDarkColorScheme: colorScheme === 'dark',
        setColorScheme,
        colors: COLORS[colorScheme ?? 'light'],
    };
}

export { useColorScheme };

export function setNavigationBar(colorScheme: 'light' | 'dark') {
    return Promise.all([
        NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark'),
        NavigationBar.setPositionAsync('absolute'),
        NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? '#00000030' : '#ffffff80'),
    ]);
}