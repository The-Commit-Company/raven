import 'expo-dev-client';
import { router, Slot, usePathname } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import "../global.css";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { setNavigationBar, themeAtom } from '@hooks/useColorScheme';
import { NAV_THEME } from '@theme/index';
import { StatusBar } from 'expo-status-bar';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Toaster } from 'sonner-native';
import { LogBox, Platform } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { setDefaultSite } from '@lib/auth';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAtom } from 'jotai';
import { useColorScheme } from 'nativewind';

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)

/** Suppressing this for now - see https://github.com/meliorence/react-native-render-html/issues/661 */
LogBox.ignoreLogs([
    /Support for defaultProps will be removed/,
]);

if (__DEV__) {
    LogBox.ignoreLogs([
        /Support for defaultProps will be removed/,
    ]);
}

const messaging = getMessaging()

export default function RootLayout() {

    // const path = usePathname()
    // console.log(path)

    const { getItem } = useAsyncStorage(`default-site`)


    useEffect(() => {

        const onMount = async () => {
            // Get the defualt site from the async storage
            // Also check if the app was started by a notification
            const initialNotification = await messaging.getInitialNotification();

            if (initialNotification) {
                if (initialNotification.data?.channel_id && initialNotification.data?.sitename) {
                    setDefaultSite(initialNotification.data.sitename as string)
                    let path = 'chat'
                    if (initialNotification.data.is_thread) {
                        path = 'thread'
                    }
                    router.navigate(`/${initialNotification.data.sitename}/${path}/${initialNotification.data.channel_id}`, {
                        withAnchor: true
                    })

                    return
                }
            }

            // If not started by notification
            // On load, check if the user has a site set
            const defaultSite = await getItem()
            if (defaultSite) {
                router.replace(`/${defaultSite}`)
            } else {
                router.replace('/landing')
            }
        }

        // Handle notification open when app is in background
        const unsubscribeOnNotificationOpen = messaging.onNotificationOpenedApp(async (remoteMessage) => {
            // console.log('Notification opened app from background state:', remoteMessage);
            if (remoteMessage.data?.channel_id && remoteMessage.data?.sitename) {
                setDefaultSite(remoteMessage.data.sitename as string)
                let path = 'chat'
                if (remoteMessage.data.is_thread === '1') {
                    path = 'thread'
                }
                router.navigate(`/${remoteMessage.data.sitename}/${path}/${remoteMessage.data.channel_id}`, {
                    withAnchor: true
                })
            }
        });

        onMount()
        // Cleanup function
        return () => {
            unsubscribeOnNotificationOpen();
        };
    }, []);

    const { colorScheme, setColorScheme } = useColorScheme();

    const isDarkColorScheme = colorScheme === 'dark'

    const [theme] = useAtom(themeAtom);

    useEffect(() => {
        if (theme.state === 'hasData') {
            if (theme.data) {
                setColorScheme(theme.data);
            }
        }
    }, [theme]);

    useEffect(() => {
        if (Platform.OS !== 'android' || !colorScheme) return;
        try {
            setNavigationBar(colorScheme)
        } catch (error) {
            console.error('useColorScheme.tsx", "setColorScheme', error);
        }
    }, [colorScheme])

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
                            <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
                                <Slot />
                                <PortalHost />
                            </ThemeProvider>
                        </KeyboardProvider>
                    </ActionSheetProvider>
                </BottomSheetModalProvider>
                <Toaster
                    position="top-center"
                    duration={2000}
                    visibleToasts={4}
                    closeButton={true}
                    toastOptions={{}}
                    pauseWhenPageIsHidden
                    theme={isDarkColorScheme ? 'dark' : 'light'}
                    swipeToDismissDirection='up'
                />
            </GestureHandlerRootView>
        </>
    )
}