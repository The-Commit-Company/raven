export interface CustomFile extends File {
    fileID: string,
    uploading?: boolean,
    uploadProgress?: number,
}