export interface CustomFile extends File {
    uri?: string,
    fileID: string,
    uploading?: boolean,
    uploadProgress?: number,
    caption?: string,
}