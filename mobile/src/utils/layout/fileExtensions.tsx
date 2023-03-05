import { FaRegFileExcel, FaRegFileImage, FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

export const imageExt = ["jpeg", "jpg", "png"]

export const excelExt = ['csv', 'xls', 'xlsx']

export const wordExt = ['doc', 'docx']

export const getFileExtensionIcon = (ext: string): React.ReactNode => {

    if (excelExt.includes(ext)) return <FaRegFileExcel />
    else if (imageExt.includes(ext)) return <FaRegFileImage />
    else if (wordExt.includes(ext)) return <FaRegFileWord />
    else if (ext === "pdf") return <FaRegFilePdf />
    else if (ext === "eml") return <HiOutlineMail />
    else return <FaRegFilePdf />
}