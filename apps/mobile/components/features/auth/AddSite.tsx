import { Avatar, AvatarImage } from '@components/nativewindui/Avatar'
import { Button } from '@components/nativewindui/Button'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useState } from 'react'
import { Alert, Keyboard, TextInput, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { CodeChallengeMethod, exchangeCodeAsync, makeRedirectUri, ResponseType, TokenResponse, useAuthRequest } from 'expo-auth-session';
import { router } from 'expo-router'
import { SiteInformation } from '../../../types/SiteInformation'
import { addSiteToStorage, discovery, setDefaultSite, storeAccessToken } from '@lib/auth'
import { FormLabel } from '@components/layout/Form'
import { useColorScheme } from '@hooks/useColorScheme'
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator'
import HowToSetupMobile from './HowToSetupMobile'

WebBrowser.maybeCompleteAuthSession();

type Props = {
    useBottomSheet?: boolean
}

const AddSite = ({ useBottomSheet = false }: Props) => {

    const { colors } = useColorScheme()

    const [siteURL, setSiteURL] = useState('')

    const bottomSheetRef = useSheetRef()

    const [isLoading, setIsLoading] = useState(false)

    const [siteInformation, setSiteInformation] = useState<SiteInformation | null>(null)

    const handleAddSite = () => {
        /**
         * When a user adds a site, we need to do the following:
         * 
         * 1. Check if the site starts with https://. If not, add it.
         * 2. Lowercase the site URL
         * 3. TODO: Check if this site is already added (this will be done later)
         * 4. Fetch the site information from the server and prompt the user to login
         */

        // Dismiss the keyboard
        Keyboard.dismiss()
        let url = siteURL.toLowerCase()
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = 'https://' + url
        }

        setIsLoading(true)

        fetch(`${url}/api/method/raven.api.raven_mobile.get_client_id`)
            .then(res => res.json())
            .then(data => {
                if (data.message && data.message.client_id) {
                    setSiteInformation({
                        url,
                        ...data.message
                    })
                    bottomSheetRef.current?.present()
                } else {
                    // TODO: Show error message/toast
                    Alert.alert('Error', 'Failed to fetch site information / OAuth client not set for Raven Mobile')
                }
            })
            .catch(err => {
                // TODO: Show error message/toast
                Alert.alert('Error', 'Failed to fetch site information. Please check the URL and try again.')
                console.error(err)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const clearSiteInformation = useCallback(() => {
        setSiteInformation(null)
    }, [])

    return (
        <View className='flex-1 gap-3'>
            <View className="flex-col gap-2">
                <View className="flex-row items-center gap-0">
                    <FormLabel className='text-base'>Site URL</FormLabel>
                </View>
                {useBottomSheet ?
                    <BottomSheetTextInput
                        className="w-full border py-3 text-[16px] border-border rounded-lg px-3 text-foreground"
                        numberOfLines={1}
                        inputMode='url'
                        autoCapitalize='none'
                        placeholder='raven.frappe.cloud'
                        placeholderTextColor={colors.grey2}
                        autoCorrect={false}
                        autoComplete='off'
                        onChangeText={setSiteURL}
                        value={siteURL}
                    />
                    :
                    <TextInput
                        className="w-full border py-3 text-[16px] border-border rounded-lg px-3 text-foreground"
                        numberOfLines={1}
                        inputMode='url'
                        autoCapitalize='none'
                        placeholder='raven.frappe.cloud'
                        placeholderTextColor={colors.grey2}
                        autoCorrect={false}
                        autoComplete='off'
                        onChangeText={setSiteURL}
                        value={siteURL}
                    />
                }
            </View>
            <Button onPress={handleAddSite} disabled={isLoading}>
                <Text>Add Site</Text>
            </Button>
            <Sheet snapPoints={[400]} ref={bottomSheetRef} onDismiss={clearSiteInformation}>
                <BottomSheetView className='pb-16'>
                    {siteInformation && <SiteAuthFlowSheet siteInformation={siteInformation} onDismiss={clearSiteInformation} />}
                </BottomSheetView>
            </Sheet>

            <HowToSetupMobile />
        </View>
    )
}

export const SiteAuthFlowSheet = ({ siteInformation, onDismiss }: { siteInformation: SiteInformation, onDismiss: () => void }) => {

    const discoveryWithURL = {
        authorizationEndpoint: siteInformation.url + discovery.authorizationEndpoint,
        tokenEndpoint: siteInformation.url + discovery.tokenEndpoint,
        revocationEndpoint: siteInformation.url + discovery.revocationEndpoint,
    }

    const [loading, setLoading] = useState(false)

    const [request, response, promptAsync] = useAuthRequest({
        responseType: ResponseType.Code,
        clientId: siteInformation.client_id,
        usePKCE: true,
        scopes: ['all', 'openid'],
        codeChallengeMethod: CodeChallengeMethod.S256,
        redirectUri: makeRedirectUri({ native: 'raven.thecommit.company:' }),
    }, discoveryWithURL)

    const onLoginClick = () => {
        // If the user clicks the login button, we need to initiate the OAuth flow
        setLoading(true)
        promptAsync()
            .then(res => {
                if (res.type === 'success') {
                    exchangeCodeAsync({
                        clientId: siteInformation.client_id,
                        code: res.params.code,
                        extraParams: {
                            code_verifier: request?.codeVerifier ?? '',
                        },
                        redirectUri: makeRedirectUri({ native: 'raven.thecommit.company:' }),
                    }, discoveryWithURL).then(data => {
                        onAccessTokenReceived(data)
                    }).catch(err => {
                        Alert.alert("Authentication Error", err.message)
                    })
                } else if (res.type === "error") {
                    Alert.alert("Authentication Error", res.error?.message ?? "Unknown error")
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const onAccessTokenReceived = (token: TokenResponse) => {
        // Once we get the access token and refresh token, we need to store the following:
        // 1. In Secure Store, store the TokenResponse with the sitename as the key
        // 2. In Async Storage, store the site information with the sitename as the key
        // 3. Redirect the user to the /[sitename] route

        storeAccessToken(siteInformation.sitename, token)
            .then(() => addSiteToStorage(siteInformation.sitename, siteInformation))
            .then(() => setDefaultSite(siteInformation.sitename))
            .then(() => router.replace(`/${siteInformation.sitename}`))
            .then(() => onDismiss())
    }

    return <View className='flex gap-4 px-4'>
        <View className='flex-row items-center gap-2'>
            <Avatar alt="Site Logo">
                <AvatarImage source={{ uri: (siteInformation.url) + (siteInformation.logo) }} width={100} height={100} />
            </Avatar>
            <View className='flex-1'>
                <Text className='text-base font-medium'>{siteInformation?.app_name}</Text>
                <Text className='text-sm text-muted-foreground'>{siteInformation?.url}</Text>
            </View>
        </View>
        <Button onPress={onLoginClick} style={{
            minHeight: 40
        }} disabled={!request || loading}>
            {loading ? <ActivityIndicator color={"#FFFFFF"} /> : <Text>Login</Text>}
        </Button>
    </View>
}

export default AddSite