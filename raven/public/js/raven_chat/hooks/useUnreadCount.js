import useSWRSubscription from "swr/subscription";
import { fetcher } from "./useFetch";

const useUnreadCount = () => {
  const { data } = useSWRSubscription(
    "raven.api.raven_message.get_unread_count_for_channels",
    (key, { next }) => {
      //Initial load
      fetcher(key).then((data) => next(null, data));

      frappe.realtime.on("raven:unread_channel_count_updated", (event) => {
        if (event.play_sound && event.sent_by !== frappe.session.user) {
          frappe.utils.play_sound("raven_notification");
        }
        fetcher(key).then((data) => next(null, data));
      });

      return () => frappe.realtime.off("raven:unread_channel_count_updated");
    },
  );

  const totalUnread =
    (data?.message?.total_unread_count_in_channels ?? 0) +
    (data?.message?.total_unread_count_in_dms ?? 0);

  return {
    ...(data?.message ?? {}),
    totalUnread,
  };
};

export const useChannelUnreadCount = (channelID) => {
  const data = useUnreadCount();

  return (
    data?.channels?.find((channel) => channel.name === channelID)
      ?.unread_count ?? 0
  );
};

export default useUnreadCount;
