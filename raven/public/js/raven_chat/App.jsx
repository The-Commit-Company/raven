import * as React from "react";
import useBoolean from "./hooks/useBoolean";
import Header from "./components/layout/Header";
import ChannelList from "./components/layout/ChannelList";
import { StartFetchContext } from "./hooks/useStartFetch";
import { SWRConfig } from "swr";
import ChatView from "./components/layout/Chat/ChatView";
import useUnreadCount from "./hooks/useUnreadCount";
import { CurrentChannelContext } from "./hooks/useCurrentChannel";

export function App() {

  const [isOpen, { on, toggle }] = useBoolean(false)

  const [initOpen, setInitOpen] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setInitOpen(true)
    }
  }, [isOpen])

  const [selectedChannel, setSelectedChannel] = React.useState('')

  const { totalUnread } = useUnreadCount()

  return (
    <StartFetchContext.Provider value={initOpen}>
      <CurrentChannelContext.Provider value={selectedChannel}>
        <SWRConfig value={{
          revalidateOnFocus: false,
          revalidateOnMount: true,
          revalidateOnReconnect: false,
          revalidateIfStale: false,
        }}>
          <div className="raven-container" data-open-state={isOpen}>
            <Header
              on={on}
              toggle={toggle}
              isOpen={isOpen}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
              unreadMessageCount={totalUnread} />
            <div className='raven-content-container' data-channel={selectedChannel} data-channel-list-view={selectedChannel ? 'false' : 'true'}>
              <ChannelList isOpen={isOpen} onSelectChannel={setSelectedChannel} />
              <ChatView selectedChannel={selectedChannel} />
            </div>
          </div>
        </SWRConfig>
      </CurrentChannelContext.Provider>
    </StartFetchContext.Provider>
  );
}