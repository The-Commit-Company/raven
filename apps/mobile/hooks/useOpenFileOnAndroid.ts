import { useState } from "react"
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes"
import * as FileSystem from 'expo-file-system'
import * as IntentLauncher from 'expo-intent-launcher'
import { getFileMimeType } from "@raven/lib/utils/operations"

export const useOpenFileOnAndroid = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const openFile = async (source: WebViewSourceUri) => {
        setLoading(true)
        try {
            const fileName = source.uri.split('/').pop();
            const cacheFile = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.downloadAsync(source.uri, cacheFile, {
                headers: source.headers as Record<string, string>,
            })

            FileSystem.getContentUriAsync(cacheFile).then((contentUri) => {
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: getFileMimeType(fileName as string),
                })
            })
                .then(() => {
                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Error getting content URI:', error)
                    setError(error)
                })

        } catch (error) {
            console.error('Error opening file:', error)
            setError(error)
        }
    }

    return { openFile, loading, error }

}