import { toast } from "sonner-native"
import * as FileSystem from 'expo-file-system'
import { useContext } from "react"
import { SiteContext } from "app/[site_id]/_layout"

/**
 * Simple hook to download a file and present a toast message
 * @param file,
 * @param fileName,
 * @returns
 */
const useFileDownload = (file: string, fileName: string) => {

    const siteInfo = useContext(SiteContext)

    const download = async () => {
        const downloadPath = FileSystem.documentDirectory + fileName

        if (file.startsWith('http') || file.startsWith('https')) {
            await FileSystem.downloadAsync(file, downloadPath)
        } else {
            await FileSystem.downloadAsync(siteInfo?.url + file, downloadPath)
        }
        toast.success('File downloaded')
    }

    return download
}

export default useFileDownload