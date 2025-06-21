import { useMemo } from 'react'
import { useIsMobile, useIsTablet, useIsLaptop, useIsDesktop } from '@/hooks/useMediaQuery'
import { Channel, formatLastMessage } from '../textUtils/formatLastMessage'

export function useFormattedLastMessage(channel: Channel, currentUser: string, senderName?: string) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isLaptop = useIsLaptop()
  const isDesktop = useIsDesktop()

  const maxLength = useMemo(() => {
    if (isMobile) return 10
    if (isTablet) return 12
    if (isLaptop) return 15
    if (isDesktop) return 25
    return 20 // fallback
  }, [isMobile, isTablet, isLaptop, isDesktop])

  const formattedMessage = useMemo(
    () => formatLastMessage(channel, currentUser, senderName, maxLength),
    [channel.last_message_details, currentUser, senderName, maxLength]
  )

  return formattedMessage
}
