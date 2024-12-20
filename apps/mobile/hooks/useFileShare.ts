import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { useState } from 'react'

const useFileShare = () => {
    const [error, setError] = useState<unknown>(null)
    const [loading, setLoading] = useState(false)
    const shareFile = async (source: Source) => {
        setLoading(true)
        const fileName = source.uri.split('/').pop()
        const cacheFile = `${FileSystem.cacheDirectory}${fileName}`
        const fileInfo = await FileSystem.getInfoAsync(cacheFile)
        if (!fileInfo.exists) {
            await FileSystem.downloadAsync(source.uri, cacheFile, {
                headers: source.headers as Record<string, string>
            })
        }
        try {
            await Sharing.shareAsync(cacheFile, {
                UTI: 'public.data',
            }).then(() => {
                setLoading(false)
            })
        } catch (error) {
            console.error('Error sharing:', error)
            setError(error)
            setLoading(false)
        }
    }
    return { shareFile, error, loading }
}

export default useFileShare