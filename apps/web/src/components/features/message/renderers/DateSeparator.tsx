import { Separator } from "@components/ui/separator"

export default function DateSeparator({ label }: { label: string }) {
    return (
        <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="mx-5 text-xs text-muted-foreground font-normal">{label}</span>
            <Separator className="flex-1" />
        </div>
    )
}
