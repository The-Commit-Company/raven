import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";

export default function DateSeparator({ label }: { label: string }) {
    return (
        <div className="sticky top-0 z-20 py-2 -mx-8 px-8 flex items-center bg-surface-white">
            <Separator className="flex-1" />
            <Badge variant="subtle" theme="gray" size='md'>{label}</Badge>
            <Separator className="flex-1" />
        </div>
    )
}
