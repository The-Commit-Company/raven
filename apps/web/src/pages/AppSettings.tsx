import { Outlet } from "react-router-dom"
import { SettingsSidebar } from "@components/features/settings/SettingsSidebar"
import { useIsMobile } from "@hooks/use-mobile"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { H4 } from "@components/ui/typography"

export default function AppSettings() {
  const isMobile = useIsMobile()

  // Settings page is a sidebar-less page, so it only has the workspace switcher (60px)
  const headerLeft = "var(--workspace-switcher-width, 60px)"
  const headerWidth = "calc(100% - var(--workspace-switcher-width, 60px))"

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ "--workspace-switcher-width": "60px" } as React.CSSProperties}>
      <WorkspaceSwitcher standalone />
      <div className="flex flex-col h-full overflow-hidden" style={{ marginLeft: "var(--workspace-switcher-width, 60px)", width: "calc(100% - var(--workspace-switcher-width, 60px))" } as React.CSSProperties}>
        <header
          className="flex items-center justify-between border-b bg-surface-white py-1.5 px-2 z-10 fixed top-0 h-(--app-header-height) transition-[left,width] duration-200 ease-linear"
          style={{
            left: headerLeft,
            width: headerWidth,
          }}
        >
          <div className="flex items-center gap-4">
            <H4>Settings</H4>
          </div>
        </header>

        <div className="pt-9 flex flex-1 overflow-hidden">
          {!isMobile && <SettingsSidebar />}
          <div className="flex-1 ml-0 sm:ml-64 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}