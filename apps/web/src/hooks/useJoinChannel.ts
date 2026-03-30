import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser";
import { RavenChannelMember } from "@raven/types/RavenChannelManagement/RavenChannelMember";
import { ChannelList } from "@raven/types/common/ChannelListItem";
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk";

export const useJoinChannel = (channelID: string) => {
  const { createDoc, error, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const { myProfile } = useCurrentRavenUser();

  const joinChannel = async () => {
    return createDoc("Raven Channel Member", {
      channel_id: channelID,
      user_id: myProfile?.name ?? "",
    }).then((result: RavenChannelMember) => {
      mutate(
        "channel_list",
        (data: { message: ChannelList } | undefined) => {
          if (data) {
            return {
              message: {
                ...data.message,
                channels: data.message.channels.map((ch) =>
                  ch.name === result.channel_id
                    ? { ...ch, member_id: result.name }
                    : ch,
                ),
              },
            };
          }
        },
        {
          revalidate: false,
        },
      );
    });
  };
  return { joinChannel, error, loading };
};
