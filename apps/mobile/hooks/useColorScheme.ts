import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { COLORS } from '@theme/colors';
import { useAtom, useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from "@react-native-async-storage/async-storage"

const themeAsyncAtom = atomWithStorage<'light' | 'dark' | undefined>('theme', undefined,
    createJSONStorage(() => AsyncStorage), {
    getOnInit: true
});

export const themeAtom = loadable(themeAsyncAtom);

function useColorScheme() {

    const { colorScheme, setColorScheme: setNativeWindColorScheme } = useNativewindColorScheme();

    const [theme] = useAtom(themeAtom);

    const setTheme = useSetAtom(themeAsyncAtom);

    React.useEffect(() => {
        if (theme.state === 'hasData') {

            if (theme.data) {
                setNativeWindColorScheme(theme.data);
            }
        }
    }, [theme]);

    async function setColorScheme(colorScheme: 'light' | 'dark') {
        setTheme(colorScheme);
        // setNativeWindColorScheme(colorScheme);
        if (Platform.OS !== 'android') return;
        try {
            await setNavigationBar(colorScheme);
        } catch (error) {
            console.error('useColorScheme.tsx", "setColorScheme', error);
        }
    }

    function toggleColorScheme() {
        return setTheme(async (theme) => theme === 'light' ? 'dark' : 'light');
    }

    return {
        colorScheme: colorScheme ?? 'light',
        isDarkColorScheme: colorScheme === 'dark',
        setColorScheme,
        toggleColorScheme,
        colors: COLORS[colorScheme ?? 'light'],
    };
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
function useInitialAndroidBarSync() {
    const { colorScheme } = useColorScheme();
    React.useEffect(() => {
        if (Platform.OS !== 'android') return;
        setNavigationBar(colorScheme).catch((error) => {
            console.error('useColorScheme.tsx", "useInitialColorScheme', error);
        });
    }, []);
}

export { useColorScheme, useInitialAndroidBarSync };

function setNavigationBar(colorScheme: 'light' | 'dark') {
    return Promise.all([
        NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark'),
        NavigationBar.setPositionAsync('absolute'),
        NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? '#00000030' : '#ffffff80'),
    ]);
}