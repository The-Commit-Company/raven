import { useTheme } from "@components/theme-provider"
import { cn } from "@lib/utils"
import { Separator } from "@components/ui/separator"
import { useState } from "react"
import themeLightImg from "../../images/theme_light_mode.png"
import themeDarkImg from "../../images/theme_dark_mode.png"
import themeSystemImg from "../../images/theme_system_mode.png"
import lightModeLeftRightImg from "../../images/light_mode_left_right.png"
import darkModeLeftRightImg from "../../images/dark_mode_left_right.png"

export default function Appearance() {
  const { theme, setTheme } = useTheme()
  const [chatStyle, setChatStyle] = useState<"Simple" | "Left-Right">("Simple")

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value)
  }

  const handleChatStyleChange = (style: "Simple" | "Left-Right") => {
    setChatStyle(style)
    // TODO: Save chat style to backend
  }

  const getChatLayoutImage = (style: "Simple" | "Left-Right") => {
    const lightModeImages = {
      Simple: themeLightImg,
      "Left-Right": lightModeLeftRightImg,
    }

    const darkModeImages = {
      Simple: themeDarkImg,
      "Left-Right": darkModeLeftRightImg,
    }

    if (theme === "light") {
      return lightModeImages[style]
    }

    if (theme === "dark") {
      return darkModeImages[style]
    }

    // For "system", check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return darkModeImages[style]
    } else {
      return lightModeImages[style]
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you want the app to look.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Theme</h3>
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
        </div>

        <Separator className="w-full" />

        {/* Chat Layout Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Chat Layout</h3>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-[600px]">
            {[
              {
                id: "Simple" as const,
                label: "Simple",
              },
              {
                id: "Left-Right" as const,
                label: "Left-Right",
              },
            ].map((option) => (
              <div key={option.id} className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChatStyleChange(option.id)}
                  className={cn(
                    "p-0 cursor-pointer rounded-md border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "w-full overflow-hidden",
                    chatStyle === option.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={getChatLayoutImage(option.id)}
                    alt={`${option.label} chat layout preview`}
                    className="w-full h-auto object-cover"
                  />
                </button>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

