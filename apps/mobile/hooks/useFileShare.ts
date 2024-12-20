import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { useState } from 'react'
import useFileURL from './useFileURL'

const useFileShare = (url: string) => {
    const source = useFileURL(url)
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const shareFile = async () => {
        if (source && source.uri) {
            setLoading(true)
            const fileName = source.uri.split('/').pop()
            const cacheFile = `${FileSystem.cacheDirectory}${fileName}`
            const fileInfo = await FileSystem.getInfoAsync(cacheFile)
            if (!fileInfo.exists) {
                await FileSystem.downloadAsync(source.uri, cacheFile, {
                    headers: source.headers as Record<string, string>
                }).catch((error) => {
                    console.error('Error downloading:', error)
                    setError('Error downloading: ' + error)
                    setLoading(false)
                })
            }
            await Sharing.shareAsync(cacheFile, {
                UTI: 'public.data',
            }).then(() => {
                setLoading(false)
            }).catch((error) => {
                console.error('Error sharing:', error)
                setError('Error sharing: ' + error)
                setLoading(false)
            })
        }
        else {
            console.error('Error sharing: source is undefined')
            setError('Error sharing: source is undefined')
            setLoading(false)
        }
    }
    return { shareFile, error, loading }
}

export default useFileShare