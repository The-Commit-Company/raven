import useSWR from "swr";
import { fetcher } from "./useFetch";
import useStartFetch from "./useStartFetch";

const useChannelList = (isOpen = false) => {
  /** Only fetch channels when Raven is first opened */
  const startFetch = useStartFetch();

  // TODO: Convert to a subscription so that channels are updated in real time
  const { data, isLoading, error } = useSWR(
    startFetch ? "raven.api.raven_channel.get_all_channels" : null,
    fetcher,
  );

  return {
    channels: data?.message?.channels,
    dm_channels: data?.message?.dm_channels,
    isLoading,
    error,
  };
};

export default useChannelList;
