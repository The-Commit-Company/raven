import { IconType } from "react-icons";
import { AiFillFileExcel, AiFillFileImage, AiFillFileMarkdown, AiFillFilePdf, AiFillFileWord } from "react-icons/ai";

export const imageExt = ["jpeg", "jpg", "png"]

export const excelExt = ['csv', 'xls', 'xlsx']

export const wordExt = ['doc', 'docx']

export const getFileExtensionIcon = (ext: string): IconType => {

    if (excelExt.includes(ext)) return AiFillFileExcel
    else if (imageExt.includes(ext)) return AiFillFileImage
    else if (wordExt.includes(ext)) return AiFillFileWord
    else if (ext === "pdf") return AiFillFilePdf
    else if (ext === "eml") return AiFillFileMarkdown
    else return AiFillFilePdf
}