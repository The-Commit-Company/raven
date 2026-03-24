import { ChannelList } from "@raven/types/common/ChannelListItem";
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk";

export const useLeaveChannel = (channelID: string) => {
  const { mutate } = useSWRConfig();
  const { call, loading, error } = useFrappePostCall(
    "raven.api.raven_channel.leave_channel",
  );

  const leaveChannel = async () => {
    return call({ channel_id: channelID }).then(() => {
      mutate(
        "channel_list",
        (data: { message: ChannelList } | undefined) => {
          if (data) {
            return {
              message: {
                ...data.message,
                channels: data.message.channels.map((ch) =>
                  ch.name === channelID ? { ...ch, member_id: "" } : ch,
                ),
              },
            };
          }
        },
        { revalidate: false },
      );
    });
  };

  return { leaveChannel, loading, error };
};
