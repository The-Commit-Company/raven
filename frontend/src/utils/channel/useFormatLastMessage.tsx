import { useMemo } from 'react'
import useMediaQuery, { useIsMobile, useIsTablet, useIsLaptop, useIsDesktop } from '@/hooks/useMediaQuery'
import { Channel, formatLastMessageParts } from '../textUtils/formatLastMessage'

export function useFormattedLastMessageParts(channel: Channel, currentUser: string, senderName?: string) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isLaptop = useIsLaptop()
  const isDesktop = useIsDesktop()

  const isSmallLaptop = useMediaQuery('(max-width: 1300px)')

  // Tổng độ dài tối đa cho cả sender + content
  const baseMaxLength = useMemo(() => {
    if (channel.is_direct_message) {
      // ✅ DM → cho phép dài hơn
      if (isMobile) return 12
      if (isTablet) return 16
      if (isLaptop) return 22
      if (isDesktop) return 30
      return 26
    } else {
      // ✅ Group → tổng sẽ thấp hơn (phải chừa cho sender)
      if (isMobile) return 18
      if (isTablet) return 22
      if (isSmallLaptop) return 25
      if (isLaptop) return 28
      if (isDesktop) return 32
      return 25
    }
  }, [isMobile, isTablet, isLaptop, isSmallLaptop, isDesktop, channel.is_direct_message])

  // Tính độ dài senderLabel
  const senderLabel = useMemo(() => {
    if (!senderName) return ''
    return `${senderName}`
  }, [senderName])

  const senderLength = senderLabel.length

  // Tự động giảm contentLength dựa trên senderLength (nếu là group)
  const maxContentLength = useMemo(() => {
    const minContentLength = 8

    if (channel.is_direct_message) {
      // ✅ DM → content không bị trừ
      return baseMaxLength
    }

    // ✅ Group → content bị trừ sender
    let contentLength = Math.max(baseMaxLength - senderLength, minContentLength)

    // Clamp nếu tính ra quá lớn
    if (contentLength > 40) {
      contentLength = 20
    }

    return contentLength
  }, [baseMaxLength, senderLength, channel.is_direct_message])

  const { senderLabel: senderFinal, contentLabel } = useMemo(
    () => formatLastMessageParts(channel, currentUser, senderName, maxContentLength),
    [channel.last_message_details, currentUser, senderName, maxContentLength]
  )

  return { senderLabel: senderFinal, contentLabel }
}
