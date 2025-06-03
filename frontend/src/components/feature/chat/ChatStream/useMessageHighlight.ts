import { useEffect } from 'react'

export const useMessageHighlight = (
  highlightedMessage: string | null,
  setHighlightedMessage: (msg: string | null) => void
) => {
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (highlightedMessage) {
      timer = setTimeout(() => {
        setHighlightedMessage(null)
      }, 6000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [highlightedMessage, setHighlightedMessage])

  useEffect(() => {
    return () => {
      setHighlightedMessage(null)
    }
  }, [setHighlightedMessage])
}
