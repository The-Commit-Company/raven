import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback } from 'react'

export const useSeenMessage = () => {
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')

  const getSeenUsers = useCallback(
    async (channelId: string) => {
      try {
        if (!channelId) return []
        const result = await getSeenCall({ channel_id: channelId })
        return result.message || []
      } catch (err) {
        console.error('Fetch seen users failed:', err)
        return []
      }
    },
    [getSeenCall]
  )

  return { getSeenUsers }
}
