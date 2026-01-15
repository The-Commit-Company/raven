import { Outlet } from "react-router-dom"
import { SettingsSidebar } from "@components/features/settings/SettingsSidebar"
import { useIsMobile } from "@hooks/use-mobile"

export default function AppSettings() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full h-full">
      <header className="sticky top-0 flex items-center justify-between border-b bg-background py-1.5 px-2 z-30">
        <div className="flex items-center gap-4">
          <span className="text-md font-medium">Settings</span>
        </div>
      </header>

      <div className="flex w-full flex-1 overflow-hidden">
        {!isMobile && <SettingsSidebar />}
        <div className="flex-1 ml-0 sm:ml-64 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}