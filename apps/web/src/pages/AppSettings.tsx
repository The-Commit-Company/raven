import { Outlet } from "react-router-dom"
import { SettingsSidebar } from "@components/features/settings/SettingsSidebar"
import { useIsMobile } from "@hooks/use-mobile"
import { Separator } from "@components/ui/separator"
import { SidebarTrigger } from "@components/ui/sidebar"

export default function AppSettings() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full h-full">
      <header className="sticky top-(--app-header-height) flex items-center justify-between border-b bg-background py-2 px-2 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <SidebarTrigger className="-ml-1" />
            <div className="h-6">
              <Separator orientation="vertical" />
            </div>
          </div>

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