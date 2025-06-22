import { SidebarTrigger } from "@components/ui/sidebar";
import { Separator } from "@components/ui/separator";

export default function AppSettings() {
    return (
        <div className="flex flex-col">
            <header className="fixed w-full top-(--app-header-height) flex items-center justify-between border-b bg-background py-2 px-2">
                {/* Left side */}
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
            <div className="flex flex-1 flex-col gap-4 p-4 pt-[calc(var(--app-header-height)+20px)]">
                {Array.from({ length: 24 }).map((_, index) => (
                    <div
                        key={index}
                        className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                    />
                ))}
            </div>
        </div>
    )
} 