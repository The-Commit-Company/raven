import { SidebarTrigger } from "@components/ui/sidebar"
import { Separator } from "@components/ui/separator"
import { useTheme } from "@components/theme-provider"
import { cn } from "@lib/utils"
import themeLightImg from "../images/theme_light_mode.png"
import themeDarkImg from "../images/theme_dark_mode.png"
import themeSystemImg from "../images/theme_system_mode.png"

export default function AppSettings() {
    const { theme, setTheme } = useTheme()

    const handleThemeChange = (value: "light" | "dark" | "system") => {
        setTheme(value)
    }

    return (
        <div className="flex flex-col">
            <header className="fixed w-full top-(--app-header-height) flex items-center justify-between border-b bg-background py-2 px-2 z-40">
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

            <main className="flex flex-1 flex-col gap-6 p-4 pt-[calc(var(--app-header-height)+20px)] max-w-5xl">
                <section className="space-y-3">
                    <div>
                        <h3 className="text-base font-bold">Theme</h3>
                    </div>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 max-w-[910px]">
                        {[
                            {
                                id: "light",
                                label: "Light",
                                image: themeLightImg,
                            },
                            {
                                id: "dark",
                                label: "Dark",
                                image: themeDarkImg,
                            },
                            {
                                id: "system",
                                label: "System",
                                image: themeSystemImg,
                            },
                        ].map((option) => (
                            <div key={option.id} className="flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleThemeChange(option.id as "light" | "dark" | "system")}
                                    className={cn(
                                        "p-0 cursor-pointer rounded-md border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        "w-full overflow-hidden",
                                        theme === option.id
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <img
                                        src={option.image}
                                        alt={`${option.label} theme preview`}
                                        className="w-full h-auto object-cover"
                                    />
                                </button>
                                <span className="text-sm font-medium">{option.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}