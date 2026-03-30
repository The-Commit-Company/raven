import { Separator } from "@components/ui/separator";

export default function DateSeparator({ label }: { label: string }) {
    return (
        <div className="sticky top-0 z-20 py-2 -mx-8 px-8 flex items-center bg-background">
            <Separator className="flex-1" />
            <span className="mx-5 text-xs px-2 py-1 rounded-md text-muted-foreground font-normal bg-accent/60">{label}</span>
            <Separator className="flex-1" />
        </div>
    )
}
