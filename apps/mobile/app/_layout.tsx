import { router, Stack, usePathname } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import "../global.css";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useColorScheme, useInitialAndroidBarSync } from '@lib/useColorScheme';
import { NAV_THEME } from '@theme/index';
import { StatusBar } from 'expo-status-bar';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function RootLayout() {

    const path = usePathname()

    console.log(path)

    useEffect(() => {
        // TODO: If authenticated and site set
        router.replace('/(tabs)/home')
    }, [])

    useInitialAndroidBarSync();
    const { colorScheme, isDarkColorScheme } = useColorScheme();

    return (
        <>
            <StatusBar
                key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
                style={isDarkColorScheme ? 'light' : 'dark'}
            />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <ActionSheetProvider>
                        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                            <ThemeProvider value={NAV_THEME[colorScheme]}>
                                <Stack>
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                    <Stack.Screen name="+not-found" />
                                </Stack>
                                <PortalHost />
                            </ThemeProvider>
                        </KeyboardProvider>
                    </ActionSheetProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </>
    )
}