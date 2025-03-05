import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { COLORS } from '@theme/colors';
import { atom, useSetAtom } from 'jotai';

export const themeAtom = atom<'light' | 'dark'>('light');

const writeThemeAtom = atom(null, (get, set, value: 'light' | 'dark') => {
    set(themeAtom, value);
});

function useColorScheme() {

    const { colorScheme, setColorScheme: setNativeWindColorScheme } = useNativewindColorScheme();

    const setThemeAtom = useSetAtom(writeThemeAtom);

    React.useEffect(() => {
        if (colorScheme) {
            setThemeAtom(colorScheme);
        } else {
            setThemeAtom('light');
        }
    }, [colorScheme]);

    async function setColorScheme(colorScheme: 'light' | 'dark') {
        setNativeWindColorScheme(colorScheme);
        if (Platform.OS !== 'android') return;
        try {
            await setNavigationBar(colorScheme);
        } catch (error) {
            console.error('useColorScheme.tsx", "setColorScheme', error);
        }
    }

    function toggleColorScheme() {
        return setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
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