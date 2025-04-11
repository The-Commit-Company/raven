import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext, useMemo } from 'react'

export type UseFileURLReturnType = {
  /**
  * `uri` is a string representing the resource identifier for the image, which
  * could be an http address, a local file path, or the name of a static image
  * resource (which should be wrapped in the `require('./path/to/image.png')`
  * function).
  */
  uri: string;
  /**
  * `headers` is an object representing the HTTP headers to send along with the
  * request for a remote image.
  */
  headers: { [key: string]: string };
}
/**
 * Since we need to pass the headers to fetch any private file,
 * Use this hook to get the file URL with the headers to fetch the file in Avatars etc
 * @param props 
 * @returns 
 */
const useFileURL = (fileURL?: string): UseFileURLReturnType | undefined => {
  const { tokenParams, url } = useContext(FrappeContext) as FrappeConfig

  const source = useMemo(() => {
    if (!fileURL) return undefined

    if (typeof fileURL === 'string') {
      if (!fileURL.trim()) return undefined
    }

    if (fileURL.startsWith('http')) {
      return {
        uri: fileURL,
        headers: {
          Authorization: `bearer ${tokenParams?.token?.()}`
        }
      }
    }

    return {
      uri: `${url}${fileURL}`,
      headers: {
        Authorization: `bearer ${tokenParams?.token?.()}`
      }
    }

  }, [fileURL, tokenParams?.token, url])

  return source
}

export default useFileURL