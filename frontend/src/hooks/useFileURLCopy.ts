import { toast } from "sonner"

/**
 * Simple hook to copy a file URL to the clipboard and present a toast message
 * @param file
 * @returns
 */
const useFileURLCopy = (file: string) => {

    const copy = () => {
        if (file.startsWith('http') || file.startsWith('https')) {
            navigator.clipboard.writeText(file)
        }
        else {
            navigator.clipboard.writeText(window.location.origin + file)
        }
        toast.success('Link copied')
    }

    return copy
}

export default useFileURLCopy