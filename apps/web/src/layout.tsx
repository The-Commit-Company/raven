import { AppSidebar } from "./components/app-sidebar"
import { Separator } from "@components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@components/ui/sidebar"
import { ChevronDown, FileText, Hash, Headset, Info, Star } from "lucide-react"

export default function Page() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "360px",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-row items-center gap-4">
                        <Star className="size-4" />
                        <div className="flex flex-row items-center gap-1">
                            <Hash className="size-4" strokeWidth={2.4} />
                            <span className="text-md font-medium">Channel Name</span>
                            <div className="mt-0.5">
                                <ChevronDown className="size-4" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                    <FileText className="size-4" />
                    <Headset className="size-4" />
                    <span className="text-sm" >Start call</span>
                    <Info className="size-4" />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({ length: 24 }).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                    ))}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
