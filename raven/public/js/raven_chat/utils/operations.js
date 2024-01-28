/* Function to return extension of a file
* @param filename name of the file with extension
* @returns extension
*/
export const getFileExtension = (filename) => {

    const extension = filename?.split('.').pop()?.toLocaleLowerCase() ?? ''
    return extension;
}

export const VIDEO_FORMATS = ['mp4', 'webm']
/**
* Function to check if a file is a video
* @param extension extension of the file
* @returns boolean
*/
export const isVideoFile = (ext) => {

    return VIDEO_FORMATS.includes(ext)
}

/**
* Function to return name of a file name without extension
* @param filename name of the file with extension
* @returns name of the file without extension
*/
export const getFileName = (filename) => {

    const name = filename?.split('/')[3]
    return name;
}