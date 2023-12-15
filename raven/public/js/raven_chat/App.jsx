import * as React from "react";
import useBoolean from "./hooks/useBoolean";
import Header from "./components/layout/Header";
import ChannelList from "./components/layout/ChannelList";
import { StartFetchContext } from "./hooks/useStartFetch";
import { SWRConfig } from "swr";

export function App() {

  const [isOpen, { on, toggle }] = useBoolean()

  const [initOpen, setInitOpen] = React.useState(false)

  const [selectedChannel, setSelectedChannel] = React.useState('')

  React.useEffect(() => {
    if (isOpen) {
      setInitOpen(true)
    }
  }, [isOpen])


  return (
    <StartFetchContext.Provider value={initOpen}>
      <SWRConfig value={{
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      }}>
        <div className="raven-container" data-open-state={isOpen}>
          <Header on={on} toggle={toggle} isOpen={isOpen} selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} />
          <div className='raven-content-container' data-channel={selectedChannel} data-channel-list-view={selectedChannel ? 'false' : 'true'}>
            <ChannelList isOpen={isOpen} onSelectChannel={setSelectedChannel} />
          </div>
        </div>
      </SWRConfig>
    </StartFetchContext.Provider>
  );
}