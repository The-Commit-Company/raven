import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { FrappeError, useFrappeEventListener, useFrappeGetCall, useSWRConfig } from 'frappe-react-sdk'
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { KeyedMutator } from 'swr'

export type UnreadChannelCountItem = {
  last_message_content: any
  name: string
  user_id?: string
  unread_count: number
  is_direct_message: 0 | 1
  last_message_timestamp: string
}

export type UnreadCountData = UnreadChannelCountItem[]

export type ChannelListItem = Pick<
  RavenChannel,
  | 'name'
  | 'channel_name'
  | 'type'
  | 'channel_description'
  | 'is_direct_message'
  | 'is_self_message'
  | 'is_archived'
  | 'creation'
  | 'owner'
  | 'last_message_details'
  | 'last_message_timestamp'
  | 'workspace'
  | 'pinned_messages_string'
  | 'group_type'
> & {
  member_id: string
  is_done: number // <== thêm dòng này
  user_labels?: string[]
}

export interface DMChannelListItem extends ChannelListItem {
  peer_user_id: string
  is_direct_message: 1
}

export interface SidebarChannelListItem extends ChannelListItem {
  is_archived: 0
}

interface ChannelList {
  channels: ChannelListItem[]
  dm_channels: DMChannelListItem[]
}

export interface ChannelListContextType extends ChannelList {
  mutate: KeyedMutator<{ message: ChannelList }>
  error?: FrappeError
  isLoading: boolean
  isValidating: boolean
}
export const ChannelListContext = createContext<ChannelListContextType | null>(null)

export const ChannelListProvider = ({ children }: PropsWithChildren) => {
  const channelListContextData = useFetchChannelList()
  return <ChannelListContext.Provider value={channelListContextData}>{children}</ChannelListContext.Provider>
}

/** Use this hook to get the channel list */
export const useChannelList = (): ChannelListContextType => {
  const context = useContext(ChannelListContext)
  if (!context) {
    throw new Error('useChannelList must be used within a ChannelListProvider')
  }
  return context
}

/**
 * Hook to fetch the channel list - all channels + DM's + other users if any
 * Also listens to the channel_list_updated event to update the channel list
 */
export const useFetchChannelList = (): ChannelListContextType => {
  const isMobile = useIsMobile()

  const { mutate: globalMutate } = useSWRConfig()
  const { data, mutate, isLoading, isValidating, ...rest } = useFrappeGetCall<{ message: ChannelList }>(
    'raven.api.raven_channel.get_all_channels',
    {
      hide_archived: false
    },
    `channel_list`,
    {
      revalidateOnFocus: isMobile ? true : false,
      onError: (error) => {
        toast.error('There was an error while fetching the channel list.', {
          description: getErrorMessage(error)
        })
      }
    }
  )
  const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(0)
  
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    if (newUpdatesAvailable) {
      timeout = setTimeout(() => {
        // mutate()
        // Also update the unread channel count
        globalMutate('unread_channel_count')
        setNewUpdatesAvailable(0)
      }, 1000) // 1 second
    }
    return () => clearTimeout(timeout)
  }, [newUpdatesAvailable])

  /**
   * If a bulk import happens, this gets called multiple times potentially causing the server to go down.
   * Instead, throttle this - wait for all events to subside
   */
  useFrappeEventListener('channel_list_updated', () => {
    if (!isValidating) {
      setNewUpdatesAvailable((n) => n + 1)
    }
  })
  return {
    channels: data?.message?.channels as ChannelListItem[],
    dm_channels: data?.message?.dm_channels as DMChannelListItem[],
    isLoading,
    isValidating,
    mutate,
    ...rest
  }
}

export const useUpdateLastMessageInChannelList = () => {
  const { mutate: globalMutate } = useSWRConfig()

  const updateLastMessageInChannelList = async (
    channelID: string,
    lastMessageTimestamp: string,
    lastMessageDetails?: any
  ) => {
    globalMutate(
      `channel_list`,
      async (channelList?: { message: ChannelList }) => {
        if (channelList) {
          let isChannelPresent = channelList.message.channels.find((channel) => channel.name === channelID)
          const isMainChannel = isChannelPresent ? true : false
          let isDMChannel = false
          if (!isChannelPresent) {
            isChannelPresent = channelList.message.dm_channels.find((channel) => channel.name === channelID)
            isDMChannel = isChannelPresent ? true : false
          }

          if (isChannelPresent) {
            // Update the last message details in the channel list
            let newChannels = channelList.message.channels
            let newDMChannels = channelList.message.dm_channels

            if (isMainChannel) {
              newChannels = newChannels.map((channel) => {
                if (channel.name === channelID) {
                  return {
                    ...channel,
                    last_message_timestamp: lastMessageTimestamp,
                    last_message_details: lastMessageDetails ?? channel.last_message_details // ✅
                  }
                }
                return channel
              })
            }

            if (isDMChannel) {
              newDMChannels = newDMChannels.map((channel) => {
                if (channel.name === channelID) {
                  return {
                    ...channel,
                    last_message_timestamp: lastMessageTimestamp,
                    last_message_details: lastMessageDetails ?? channel.last_message_details // ✅
                  }
                }
                return channel
              })
            }

            return {
              message: {
                channels: newChannels,
                dm_channels: newDMChannels
              }
            }
          }
        }

        // If nothing changed, return the same channel list
        return channelList
      },
      {
        revalidate: false
      }
    )
  }

  return { updateLastMessageInChannelList }
}

export const useUpdateLastMessageDetails = () => {
  const { mutate } = useChannelList()

  const updateLastMessageForChannel = (channelID: string, message: any, lastMessageTimestamp?: string) => {
    const timestamp = lastMessageTimestamp ?? new Date().toISOString()

    mutate(
      (prev) => {
        if (!prev) return prev

        const updateChannel = (channel: ChannelListItem) => {
          if (channel.name === channelID) {
            return {
              ...channel,
              last_message_details: message,
              last_message_timestamp: timestamp,
              unread_count: 0
            }
          }
          return channel
        }

        return {
          message: {
            channels: prev.message.channels.map(updateChannel),
            dm_channels: prev.message.dm_channels.map(updateChannel)
          }
        }
      },
      { revalidate: false }
    )
  }

  return { updateLastMessageForChannel }
}
