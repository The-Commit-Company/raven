/**
 * Function to remove the current user from the DM Channel Name - used when the peer user is not found
 * @param channelName 
 * @param currentUser 
 * @returns 
 */
export const replaceCurrentUserFromDMChannelName = (channelName: string, currentUser: string) => {
    return channelName.replace(currentUser, '').replace(' _ ', '')
}

/**
 * Function to return extension of a file
 * @param filename name of the file with extension
 * @returns extension
 */
export const getFileExtension = (filename: string) => {

    const extension = filename?.split('.').pop()?.toLocaleLowerCase() ?? ''
    return extension;
}

export const VIDEO_FORMATS = ['mp4', 'webm']
/**
 * Function to check if a file is a video
 * @param extension extension of the file
 * @returns boolean
 */
export const isVideoFile = (ext: string) => {

    return VIDEO_FORMATS.includes(ext)
}

export const IMAGE_FORMATS = ['jpg', 'jpeg', 'png']
/**
 * Function to check if a file is an image
 * @param extension extension of the file
 * @returns boolean
 */
export const isImageFile = (ext: string) => {

    return IMAGE_FORMATS.includes(ext)
}

/**
 * Function to return name of a file name without extension
 * @param filename name of the file with extension
 * @returns name of the file without extension
 */
export const getFileName = (filename: string) => {

    const name = filename?.split('/')[3]
    return name;
}

export const getFileMimeType = (fileName: string) => {
    const extension = getFileExtension(fileName)
    const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        mp4: 'video/mp4',
    };
    return mimeTypes[extension as keyof typeof mimeTypes] || '*/*';
}

// list of mostly used file extensions
export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'ico', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']