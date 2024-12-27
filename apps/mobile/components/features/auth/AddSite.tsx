import { Avatar, AvatarImage } from '@components/nativewindui/Avatar'
import { Button } from '@components/nativewindui/Button'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { TextField } from '@components/nativewindui/TextField'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useState } from 'react'
import { Alert, Keyboard, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { CodeChallengeMethod, exchangeCodeAsync, makeRedirectUri, ResponseType, TokenResponse, useAuthRequest } from 'expo-auth-session';
import { router } from 'expo-router'
import { SiteInformation } from '../../../types/SiteInformation'
import { addSiteToStorage, discovery, setDefaultSite, storeAccessToken } from '@lib/auth'

WebBrowser.maybeCompleteAuthSession();

type Props = {}

const AddSite = (props: Props) => {

    const [siteURL, setSiteURL] = useState('')

    const bottomSheetRef = useSheetRef()

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

        fetch(`${url}/api/method/raven.api.raven_mobile.get_client_id`)
            .then(res => res.json())
            .then(data => {
                if (data.message && data.message.client_id) {
                    console.log(data.message)
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
    }

    const clearSiteInformation = useCallback(() => {
        setSiteInformation(null)
    }, [])

    return (
        <View className='flex-1 gap-3'>
            <TextField
                placeholder='https://ravenchat.ai'
                inputMode='url'
                autoCapitalize='none'
                autoComplete='off'
                autoCorrect={false}
                label='Site URL'
                onChangeText={setSiteURL} />
            <Button onPress={handleAddSite}>
                <Text>Add Site</Text>
            </Button>
            <Sheet snapPoints={[400]} ref={bottomSheetRef} onDismiss={clearSiteInformation}>
                <BottomSheetView className='pb-16'>
                    {siteInformation && <SiteAuthFlowSheet siteInformation={siteInformation} onDismiss={clearSiteInformation} />}
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

const SiteAuthFlowSheet = ({ siteInformation, onDismiss }: { siteInformation: SiteInformation, onDismiss: () => void }) => {

    const discoveryWithURL = {
        authorizationEndpoint: siteInformation.url + discovery.authorizationEndpoint,
        tokenEndpoint: siteInformation.url + discovery.tokenEndpoint,
        revocationEndpoint: siteInformation.url + discovery.revocationEndpoint,
    }

    const [request, response, promptAsync] = useAuthRequest({
        responseType: ResponseType.Code,
        clientId: siteInformation.client_id,
        usePKCE: true,
        scopes: ['all', 'openid'],
        codeChallengeMethod: CodeChallengeMethod.S256,
        redirectUri: makeRedirectUri({}),
    }, discoveryWithURL)

    const onLoginClick = () => {
        // If the user clicks the login button, we need to initiate the OAuth flow
        promptAsync()
            .then(res => {
                if (res.type === 'success') {
                    exchangeCodeAsync({
                        clientId: siteInformation.client_id,
                        code: res.params.code,
                        extraParams: {
                            code_verifier: request?.codeVerifier ?? '',
                        },
                        redirectUri: makeRedirectUri({}),
                    }, discoveryWithURL).then(data => {
                        console.log("Access Token: ", data)
                        onAccessTokenReceived(data)
                    }).catch(err => {
                        Alert.alert("Authentication Error", err.message)
                    })
                } else if (res.type === "error") {
                    Alert.alert("Authentication Error", res.error?.message ?? "Unknown error")
                }
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
                <Text>{siteInformation?.app_name}</Text>
                <Text>{siteInformation?.url}</Text>
            </View>
        </View>
        <Button onPress={onLoginClick} disabled={!request}>
            <Text>Login</Text>
        </Button>
    </View>
}

export default AddSite