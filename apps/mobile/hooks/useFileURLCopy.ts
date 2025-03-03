import { toast } from "sonner-native"
import * as Clipboard from 'expo-clipboard'
import { useContext } from "react"
import { SiteContext } from "app/[site_id]/_layout"

/**
 * Simple hook to copy a file URL to the clipboard and present a toast message
 * @param file
 * @returns
 */
const useFileURLCopy = (file: string) => {

    const siteInfo = useContext(SiteContext)

    const copy = async () => {
        if (file.startsWith('http') || file.startsWith('https')) {
            await Clipboard.setStringAsync(file)
        }
        else {
            await Clipboard.setStringAsync(siteInfo?.url + file)
        }
        toast.success('Link copied')
    }

    return copy
}

export default useFileURLCopy