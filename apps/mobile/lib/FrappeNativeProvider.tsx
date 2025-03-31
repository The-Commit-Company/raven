import { FrappeProvider } from 'frappe-react-sdk'
import { PropsWithChildren } from 'react'
import { SiteInformation } from 'types/SiteInformation'
import { AppState, AppStateStatus } from 'react-native'
import { NetworkState, addNetworkStateListener } from 'expo-network'

const FrappeNativeProvider = ({ siteInfo, getAccessToken, children }: PropsWithChildren<{ siteInfo: SiteInformation | null, getAccessToken: () => string }>) => {

    return (
        <FrappeProvider
            url={siteInfo?.url}
            tokenParams={{
                type: 'Bearer',
                useToken: true,
                token: getAccessToken,
            }}
            siteName={siteInfo?.sitename}
            swrConfig={{
                keepPreviousData: true,
                // A provider is required to use initFocus and initReconnect
                provider: () => new Map(),
                isVisible() {
                    return AppState.currentState === 'active'
                },
                isOnline() {
                    // We can't get the network state synchronously, so we'll assume online
                    // The initReconnect handler will handle the actual network state changes
                    return true
                },
                initFocus(callback) {

                    let appState = AppState.currentState

                    const onAppStateChange = (nextAppState: AppStateStatus) => {

                        /* If it's resuming from background or inactive mode to active one */
                        if (appState.match(/inactive|background/) && nextAppState === 'active') {
                            callback()
                        }
                        appState = nextAppState
                    }

                    // Subscribe to the app state change events
                    const subscription = AppState.addEventListener('change', onAppStateChange)

                    return () => {
                        subscription.remove()
                    }
                },
                initReconnect(callback) {

                    let isConnected = true

                    const onNetworkStateChange = (state: NetworkState) => {
                        const currentIsConnected = state.isInternetReachable ?? (state.isConnected ?? false)

                        if (currentIsConnected !== isConnected) {
                            isConnected = currentIsConnected
                            if (isConnected) {
                                // Callback when the network is restored
                                callback()
                            }
                        }
                    }

                    const subscription = addNetworkStateListener(onNetworkStateChange)

                    return () => {
                        subscription.remove()
                    }
                },

            }}

        >
            {children}
        </FrappeProvider>
    )
}

export default FrappeNativeProvider