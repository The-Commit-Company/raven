import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser";
import { RavenUser } from "@raven/types/Raven/RavenUser";
import { FrappeContext, FrappeConfig } from "frappe-react-sdk";
import { useContext, useMemo } from "react";
import { useChannels } from "./useChannels";

export function useChannel(channelID: string) {
  const { channels } = useChannels()
  const { call } = useContext(FrappeContext) as FrappeConfig
  const { myProfile, mutate: mutateUser } = useCurrentRavenUser()

  const channel = useMemo(() => {
    return channels.find((channel) => channel.name === channelID)
  }, [channels, channelID])

  const toggleStarChannel = async () => {
    return call
      .post("raven.api.raven_channel.toggle_pinned_channel", {
        channel_id: channelID,
      })
      .then((res: { message: RavenUser }) => {
        if (res.message) {
          mutateUser({ message: res.message }, { revalidate: false })
        }
      })
  }

  const isStarred = useMemo(() => {
    if (myProfile) {
      return myProfile.pinned_channels
        ?.map((pin) => pin.channel_id)
        .includes(channelID)
    } else {
      return false
    }
  }, [channelID, myProfile])

  return {
    channel,
    toggleStarChannel,
    isStarred,
  }
}
