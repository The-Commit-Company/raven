import { useFrappePostCall } from 'frappe-react-sdk'

type RemoveChannelResponse = {
  message: string
}

export const useRemoveChannelFromLabel = () => {
  const { call, loading, error } = useFrappePostCall<RemoveChannelResponse>(
    'raven.api.user_channel_label.remove_channel_from_label'
  )

  const removeChannel = async (label_id: string, channel_id: string): Promise<string> => {
    const res = await call({ label_id, channel_id })
    return res.message // giờ đây không bị lỗi TypeScript nữa
  }

  return {
    removeChannel,
    loading,
    error,
  }
}
