import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppSettings from "./pages/AppSettings"
import Channel from "@pages/Channel"
import Mentions from "@pages/Mentions"
import SavedMessages from "@pages/SavedMessages"
import Search from "@pages/Search"
import ChannelSettings from "@components/features/channel/ChannelSettings/ChannelSettings"
import MainPage from "@pages/MainPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<Channel />} />
          <Route path="channel/:id" element={<Channel />} />
          <Route path="channel/:id/settings" element={<ChannelSettings />} />
          <Route path="mentions" element={<Mentions />} />
          <Route path="settings" element={<AppSettings />} />
          <Route path="saved-messages" element={<SavedMessages />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
