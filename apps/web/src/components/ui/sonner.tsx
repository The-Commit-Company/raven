import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react"
import { useTheme } from "@components/theme-provider"
import { Spinner } from "./spinner"

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme}
            className="toaster group"
            icons={{
                success: (
                    <CircleCheckIcon className="size-4 text-ink-green-5" />
                ),
                info: (
                    <InfoIcon className="size-4 text-ink-blue-5" />
                ),
                warning: (
                    <TriangleAlertIcon className="size-4 text-ink-amber-5" />
                ),
                error: (
                    <OctagonXIcon className="size-4 text-ink-red-5" />
                ),
                loading: (
                    <Spinner className="size-4" />
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--surface-gray-9)",
                    "--normal-text": "var(--ink-base)",
                    "--normal-border": "var(--surface-gray-9)",
                    "--border-radius": "var(--radius-md)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
