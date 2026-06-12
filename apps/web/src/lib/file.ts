/**
 * Function to return extension of a file
 * @param filename name of the file with extension
 * @returns extension
 */
export const getFileExtension = (filename: string) => {

    const fileNameWithoutQuery = filename?.split('?')[0]

    const extension = fileNameWithoutQuery?.split('.').pop()?.toLocaleLowerCase() ?? ''
    return extension;
}

/**
 * Function to format bytes to human readable format
 * @param bytes size in bytes
 * @param decimals number of decimal places
 * @returns string of human readable size
 */
export const formatBytes = (bytes: number, decimals = 2) => {

    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}


export const imageExt = ["jpeg", "jpg", "png"]

export const excelExt = ['csv', 'xls', 'xlsx']

export const pptExt = ['ppt', 'pptx']

export const wordExt = ['doc', 'docx']

export const videoExt = ['mp4', 'mkv', 'webm', 'avi', 'mov']

export const audioExt = ['mp3', 'wav', 'ogg', 'flac']

export const getFileType = (ext: string) => {
    switch (ext) {
        case 'pdf': return 'pdf'
        case 'doc': return 'word'
        case 'docx': return 'word'
        case 'xls': return 'excel'
        case 'xlsx': return 'excel'
        case 'ppt': return 'powerpoint'
        case 'pptx': return 'powerpoint'
        case 'mp3': return 'audio'
        case 'wav': return 'audio'
        case 'ogg': return 'audio'
        case 'flac': return 'audio'
        case 'mp4': return 'video'
        case 'mkv': return 'video'
        case 'webm': return 'video'
        case 'avi': return 'video'
        case 'mov': return 'video'
        case 'jpeg': return 'image'
        case 'jpg': return 'image'
        case 'png': return 'image'
        default: return 'file'
    }
}
/** Triggers a browser download of a (session-authenticated) file URL. */
export const downloadFile = (url: string, fileName?: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || ''
    anchor.rel = 'noopener'
    anchor.click()
}

/** Fetches a (session-authenticated) file URL into a File for the Web Share API. */
const fetchAsFile = async (url: string, fileName: string): Promise<File | null> => {
    try {
        const response = await fetch(url, { credentials: 'include' })
        if (!response.ok) return null
        const blob = await response.blob()
        return new File([blob], fileName || 'file', { type: blob.type })
    } catch {
        return null
    }
}

/**
 * Shares the FILE itself where the platform allows it (recipient gets the
 * file, not a link needing a Raven session), falling back to a URL share,
 * then to copying the link. Returns 'copied' when the clipboard fallback ran
 * so callers can toast.
 */
export const shareFile = async (fileUrl: string, fileName: string): Promise<'shared' | 'copied'> => {
    const url = new URL(fileUrl, window.location.origin).href

    const file = await fetchAsFile(url, fileName)
    if (file && navigator.canShare?.({ files: [file] })) {
        // a rejected promise here is the user dismissing the share sheet
        await navigator.share({ files: [file] }).catch(() => { })
        return 'shared'
    }

    if (navigator.share) {
        await navigator.share({ title: fileName, url }).catch(() => { })
        return 'shared'
    }

    await navigator.clipboard.writeText(url)
    return 'copied'
}
